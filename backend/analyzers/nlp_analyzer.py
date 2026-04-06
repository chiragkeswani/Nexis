"""
NLP-based Answer Analyzer
Uses NLTK for:
  - Sentiment analysis (VADER)
  - Hedging language detection
  - Vocabulary diversity (type-token ratio)
  - Repetition detection (scripted response indicator)
"""

import re
from collections import Counter
from schemas import NLPAnalysisResult
from config import HEDGE_WORD_RATIO_THRESHOLD, REPETITION_THRESHOLD, TYPE_TOKEN_RATIO_LOW

import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Ensure NLTK data is available
_NLTK_DATA_DOWNLOADED = False


def _ensure_nltk_data():
    global _NLTK_DATA_DOWNLOADED
    if _NLTK_DATA_DOWNLOADED:
        return
    for resource in ["vader_lexicon", "punkt", "punkt_tab", "averaged_perceptron_tagger"]:
        try:
            nltk.data.find(f"tokenizers/{resource}" if "punkt" in resource else f"sentiment/{resource}" if "vader" in resource else f"taggers/{resource}")
        except LookupError:
            nltk.download(resource, quiet=True)
    _NLTK_DATA_DOWNLOADED = True


# Common hedge words / phrases
HEDGE_WORDS = {
    "maybe", "perhaps", "possibly", "probably", "might", "could",
    "i think", "i guess", "i suppose", "sort of", "kind of",
    "basically", "actually", "honestly", "frankly", "like",
    "you know", "i mean", "i believe", "it seems", "somewhat",
    "apparently", "presumably", "arguably",
}

# Filler words (separate from hedges)
FILLER_WORDS = {"um", "uh", "er", "ah", "hmm", "well", "so", "like"}


def _tokenize(text: str) -> list[str]:
    """Simple word tokenization."""
    return re.findall(r"\b[a-z']+\b", text.lower())


def _count_hedge_words(text: str, tokens: list[str]) -> tuple[int, list[str]]:
    """Count hedge words/phrases in the text."""
    text_lower = text.lower()
    count = 0
    found: list[str] = []

    # Multi-word hedges (check in text)
    for hedge in HEDGE_WORDS:
        if " " in hedge:
            occurrences = text_lower.count(hedge)
            if occurrences > 0:
                count += occurrences
                found.append(hedge)

    # Single-word hedges (check in tokens)
    single_hedges = {h for h in HEDGE_WORDS if " " not in h}
    for token in tokens:
        if token in single_hedges:
            count += 1
            if token not in found:
                found.append(token)

    return count, found


def _count_fillers(tokens: list[str]) -> int:
    """Count filler words."""
    return sum(1 for t in tokens if t in FILLER_WORDS)


def _type_token_ratio(tokens: list[str]) -> float:
    """Vocabulary diversity metric."""
    if not tokens:
        return 0.0
    return len(set(tokens)) / len(tokens)


def _detect_repetition(tokens: list[str], n: int = 3) -> tuple[int, list[str]]:
    """Detect repeated n-grams (scripted response indicator)."""
    if len(tokens) < n:
        return 0, []

    ngrams = [" ".join(tokens[i : i + n]) for i in range(len(tokens) - n + 1)]
    counts = Counter(ngrams)
    repeated = [(gram, c) for gram, c in counts.items() if c >= REPETITION_THRESHOLD]
    return len(repeated), [gram for gram, _ in repeated]


def analyze_text(transcript: str) -> NLPAnalysisResult:
    """
    Analyze interview transcript text.

    Parameters
    ----------
    transcript : str
        The textual transcript of the candidate's answers.

    Returns
    -------
    NLPAnalysisResult
    """
    if not transcript or not transcript.strip():
        return NLPAnalysisResult(
            sentiment_score=50.0,
            hedging_score=50.0,
            diversity_score=50.0,
            combined_score=50.0,
            flags=["no_transcript"],
            details={"error": "Empty or missing transcript"},
        )

    _ensure_nltk_data()

    tokens = _tokenize(transcript)
    word_count = len(tokens)
    flags: list[str] = []
    details: dict = {"word_count": word_count}

    if word_count < 10:
        return NLPAnalysisResult(
            sentiment_score=50.0,
            hedging_score=50.0,
            diversity_score=50.0,
            combined_score=50.0,
            flags=["transcript_too_short"],
            details=details,
        )

    # ---- 1. Sentiment analysis (VADER) ----
    sia = SentimentIntensityAnalyzer()
    sentiment = sia.polarity_scores(transcript)
    details["sentiment"] = sentiment

    # Map compound score [-1, 1] to a 0-100 score
    # Neutral to moderately positive → higher truthfulness signal
    compound = sentiment["compound"]
    if compound >= 0:
        sentiment_score = 50 + compound * 30  # 50-80 range
    else:
        sentiment_score = 50 + compound * 30  # 20-50 range

    # Extreme sentiment in either direction is suspicious
    if abs(compound) > 0.8:
        sentiment_score -= 10
        flags.append("extreme_sentiment")

    sentiment_score = float(np.clip(sentiment_score, 0, 100)) if 'np' in dir() else max(0, min(100, sentiment_score))

    # ---- 2. Hedging language ----
    hedge_count, hedge_words_found = _count_hedge_words(transcript, tokens)
    hedge_ratio = hedge_count / max(word_count, 1)
    details["hedge_count"] = hedge_count
    details["hedge_ratio"] = round(hedge_ratio, 3)
    details["hedge_words_found"] = hedge_words_found

    hedging_score = 70.0
    if hedge_ratio > HEDGE_WORD_RATIO_THRESHOLD * 2:
        hedging_score -= 30
        flags.append("excessive_hedging")
    elif hedge_ratio > HEDGE_WORD_RATIO_THRESHOLD:
        hedging_score -= 15
        flags.append("moderate_hedging")

    # Filler words
    filler_count = _count_fillers(tokens)
    filler_ratio = filler_count / max(word_count, 1)
    details["filler_count"] = filler_count
    details["filler_ratio"] = round(filler_ratio, 3)

    if filler_ratio > 0.05:
        hedging_score -= 10
        flags.append("excessive_fillers")

    hedging_score = max(0, min(100, hedging_score))

    # ---- 3. Vocabulary diversity ----
    ttr = _type_token_ratio(tokens)
    details["type_token_ratio"] = round(ttr, 3)

    diversity_score = 70.0
    if ttr < TYPE_TOKEN_RATIO_LOW:
        diversity_score -= 25
        flags.append("low_vocabulary_diversity")
    elif ttr < TYPE_TOKEN_RATIO_LOW + 0.1:
        diversity_score -= 10

    diversity_score = max(0, min(100, diversity_score))

    # ---- 4. Repetition detection ----
    rep_count, repeated_grams = _detect_repetition(tokens)
    details["repeated_trigrams"] = rep_count
    details["repeated_phrases"] = repeated_grams

    if rep_count > 3:
        flags.append("scripted_response")
        diversity_score -= 15
    elif rep_count > 0:
        flags.append("some_repetition")

    diversity_score = max(0, min(100, diversity_score))

    # ---- Combine ----
    combined = (sentiment_score * 0.3 + hedging_score * 0.35 + diversity_score * 0.35)
    combined = max(0, min(100, combined))

    return NLPAnalysisResult(
        sentiment_score=round(sentiment_score, 1),
        hedging_score=round(hedging_score, 1),
        diversity_score=round(diversity_score, 1),
        combined_score=round(combined, 1),
        flags=flags,
        details=details,
    )
