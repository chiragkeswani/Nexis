"""
Truth Score Computation Engine
Combines outputs from facial, voice, and NLP analyzers
to produce a final Truth Score and Confidence Score.
"""

from schemas import FacialAnalysisResult, VoiceAnalysisResult, NLPAnalysisResult
from config import (
    FACIAL_WEIGHT,
    VOICE_WEIGHT,
    NLP_WEIGHT,
    TRUTH_SCORE_HIGH,
    TRUTH_SCORE_LOW,
)


def _generate_summary(truth_score: float, confidence_score: float, soft_skills: dict, flags: list) -> str:
    """Generate a recruiter-friendly summary based on the analysis results."""
    if not soft_skills:
        return "Insufficient data to generate a comprehensive behavioral summary."

    conf = soft_skills.get("confidence", 50)
    clarity = soft_skills.get("clarity", 50)
    eng = soft_skills.get("engagement", 50)

    summary_parts = []

    # Opening sentiment based on truth_score/confidence
    if truth_score >= 75:
        summary_parts.append("The candidate presents as highly authentic and composed.")
    elif truth_score <= 45:
        summary_parts.append("Several behavioral inconsistencies were noted during the session.")
    else:
        summary_parts.append("The candidate showed a balanced performance with some areas of variation.")

    # Soft skill highlights
    if conf >= 80:
        summary_parts.append("They demonstrate exceptional confidence and emotional stability.")
    elif conf <= 40:
        summary_parts.append("Markers of hesitation or anxiety were present in their delivery.")

    if clarity >= 80:
        summary_parts.append("Communication is remarkably clear, articulate, and well-structured.")
    elif clarity <= 40:
        summary_parts.append("Their delivery style was somewhat disjointed or lacked variety.")

    if eng >= 80:
        summary_parts.append("The candidate is highly engaging, showing positive facial affect and sentiment.")

    # Specific flag mentions
    if "frequent_gaze_aversion" in flags:
        summary_parts.append("Notable shifts in eye contact suggests possible discomfort with certain topics.")
    if "high_voice_stress" in flags:
        summary_parts.append("Vocals exhibited stress markers that may indicate nervous tension.")

    # Final recommendation-style closing
    if truth_score >= 70 and conf >= 70:
        summary_parts.append("Overall, the candidate is a strong, consistent communicator.")
    elif truth_score < 50:
        summary_parts.append("Recommend follow-up questions to probe for consistency on key technical topics.")

    return " ".join(summary_parts)


def compute_truth_score(
    facial: FacialAnalysisResult | None,
    voice: VoiceAnalysisResult | None,
    nlp: NLPAnalysisResult | None,
) -> dict:
    """
    Compute the final Truth Score and Confidence Score by combining
    all module outputs.

    Returns
    -------
    dict with keys:
        truth_score, confidence_score, classification,
        behavioral_flags, detailed_analysis
    """
    scores: dict[str, float] = {}
    weights: dict[str, float] = {}
    all_flags: list[str] = []
    detailed: dict = {}

    # ---- Collect available module scores ----
    if facial is not None:
        scores["facial"] = facial.combined_score
        weights["facial"] = FACIAL_WEIGHT
        all_flags.extend(facial.flags)
        detailed["facial"] = {
            "expression_score": facial.expression_score,
            "eye_movement_score": facial.eye_movement_score,
            "combined_score": facial.combined_score,
            "flags": facial.flags,
            **facial.details,
        }

    if voice is not None:
        scores["voice"] = voice.combined_score
        weights["voice"] = VOICE_WEIGHT
        all_flags.extend(voice.flags)
        detailed["voice"] = {
            "voice_stress_score": voice.voice_stress_score,
            "speech_rate_score": voice.speech_rate_score,
            "combined_score": voice.combined_score,
            "flags": voice.flags,
            **voice.details,
        }

    if nlp is not None:
        scores["nlp"] = nlp.combined_score
        weights["nlp"] = NLP_WEIGHT
        all_flags.extend(nlp.flags)
        detailed["nlp"] = {
            "sentiment_score": nlp.sentiment_score,
            "hedging_score": nlp.hedging_score,
            "diversity_score": nlp.diversity_score,
            "combined_score": nlp.combined_score,
            "flags": nlp.flags,
            **nlp.details,
        }

    # ---- Weighted average ----
    if not scores:
        return {
            "truth_score": 50.0,
            "confidence_score": 0.0,
            "classification": "Insufficient Data",
            "behavioral_flags": ["no_data_provided"],
            "detailed_analysis": detailed,
        }

    total_weight = sum(weights.values())
    truth_score = sum(scores[k] * weights[k] for k in scores) / total_weight
    truth_score = round(max(0, min(100, truth_score)), 1)

    # ---- Confidence score ----
    # Based on how many modules contributed + data quality signals
    module_count = len(scores)
    module_coverage = module_count / 3.0  # 3 total modules

    # Penalize confidence if data quality flags are present
    quality_flags = {
        "video_unreadable", "audio_unreadable", "audio_too_short",
        "no_transcript", "transcript_too_short",
    }
    quality_penalties = sum(1 for f in all_flags if f in quality_flags)

    confidence_score = module_coverage * 100 - quality_penalties * 15
    confidence_score = round(max(0, min(100, confidence_score)), 1)

    # ---- Classification ----
    if truth_score >= TRUTH_SCORE_HIGH:
        classification = "Likely Truthful"
    elif truth_score < TRUTH_SCORE_LOW:
        classification = "Potential Deception Indicators"
    else:
        classification = "Uncertain"

    # De-duplicate flags while preserving order
    seen = set()
    unique_flags = []
    for f in all_flags:
        if f not in seen:
            seen.add(f)
            unique_flags.append(f)

    # ---- Soft Skills Mapping (Portfolio Feature) ----
    e_val = detailed.get("facial", {}).get("expression_score", 50)
    eye_val = detailed.get("facial", {}).get("eye_movement_score", 50)
    v_stress = detailed.get("voice", {}).get("voice_stress_score", 50)
    v_rate = detailed.get("voice", {}).get("speech_rate_score", 50)
    n_sent = detailed.get("nlp", {}).get("sentiment_score", 50)
    n_hedge = detailed.get("nlp", {}).get("hedging_score", 50)
    n_div = detailed.get("nlp", {}).get("diversity_score", 50)

    soft_skills = {
        "confidence": round((eye_val * 0.4 + v_stress * 0.3 + n_hedge * 0.3), 1),
        "clarity": round((v_rate * 0.5 + n_div * 0.5), 1),
        "engagement": round((e_val * 0.5 + n_sent * 0.5), 1),
    }

    detailed["soft_skills"] = soft_skills
    detailed["recruiter_summary"] = _generate_summary(
        truth_score, confidence_score, soft_skills, unique_flags
    )

    detailed["scoring"] = {
        "weights_used": weights,
        "module_scores": scores,
        "modules_available": module_count,
    }

    return {
        "truth_score": truth_score,
        "confidence_score": confidence_score,
        "classification": classification,
        "behavioral_flags": unique_flags,
        "detailed_analysis": detailed,
    }

