"""
Voice Stress Analyzer
Uses Librosa to analyze audio for:
  - Pitch variation and jitter
  - Speech rate (onset-based)
  - Energy variation (stress spikes)
  - Pause patterns
"""

import numpy as np
import librosa
from schemas import VoiceAnalysisResult
from config import (
    PITCH_JITTER_THRESHOLD,
    ENERGY_SPIKE_THRESHOLD,
    PAUSE_DURATION_THRESHOLD,
    SPEECH_RATE_NORMAL_RANGE,
)


def analyze_audio(audio_path: str) -> VoiceAnalysisResult:
    """
    Analyze an audio file for voice stress indicators.

    Parameters
    ----------
    audio_path : str
        Path to the uploaded audio file.

    Returns
    -------
    VoiceAnalysisResult
    """
    try:
        y, sr = librosa.load(audio_path, sr=22050, mono=True)
    except Exception as e:
        return VoiceAnalysisResult(
            voice_stress_score=50.0,
            speech_rate_score=50.0,
            combined_score=50.0,
            flags=["audio_unreadable"],
            details={"error": str(e)},
        )

    duration = librosa.get_duration(y=y, sr=sr)
    if duration < 1.0:
        return VoiceAnalysisResult(
            voice_stress_score=50.0,
            speech_rate_score=50.0,
            combined_score=50.0,
            flags=["audio_too_short"],
            details={"duration_sec": round(duration, 2)},
        )

    flags: list[str] = []
    details: dict = {"duration_sec": round(duration, 2)}

    # ---- 1. Pitch analysis (F0 via pyin) ----
    f0, voiced_flag, voiced_prob = librosa.pyin(
        y, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C7"), sr=sr
    )
    f0_valid = f0[~np.isnan(f0)] if f0 is not None else np.array([])

    pitch_score = 70.0
    if len(f0_valid) > 1:
        f0_mean = float(np.mean(f0_valid))
        f0_std = float(np.std(f0_valid))
        details["pitch_mean_hz"] = round(f0_mean, 1)
        details["pitch_std_hz"] = round(f0_std, 1)

        # Jitter: average absolute difference between consecutive F0 values
        jitter = float(np.mean(np.abs(np.diff(f0_valid))) / max(f0_mean, 1))
        details["pitch_jitter"] = round(jitter, 4)

        if jitter > PITCH_JITTER_THRESHOLD:
            pitch_score -= 20
            flags.append("high_pitch_jitter")

        # Very high pitch std → stress indicator
        if f0_std > f0_mean * 0.3:
            pitch_score -= 10
            flags.append("high_pitch_variability")
    else:
        details["pitch_note"] = "insufficient_voiced_frames"

    pitch_score = float(np.clip(pitch_score, 0, 100))

    # ---- 2. Energy / RMS analysis ----
    rms = librosa.feature.rms(y=y)[0]
    rms_mean = float(np.mean(rms))
    rms_std = float(np.std(rms))
    details["rms_mean"] = round(rms_mean, 4)
    details["rms_std"] = round(rms_std, 4)

    energy_score = 70.0
    if rms_std > 0:
        spike_count = int(np.sum(rms > rms_mean + ENERGY_SPIKE_THRESHOLD * rms_std))
        spike_ratio = spike_count / len(rms)
        details["energy_spike_ratio"] = round(spike_ratio, 3)

        if spike_ratio > 0.1:
            energy_score -= 20
            flags.append("high_energy_spikes")
    else:
        details["energy_note"] = "constant_energy"

    energy_score = float(np.clip(energy_score, 0, 100))

    # ---- 3. Speech rate via onset detection ----
    onsets = librosa.onset.onset_detect(y=y, sr=sr, units="time")
    onset_count = len(onsets)
    speech_rate = (onset_count / duration) * 60 if duration > 0 else 0  # onsets/min
    details["onset_count"] = onset_count
    details["speech_rate_onsets_per_min"] = round(speech_rate, 1)

    rate_score = 70.0
    low_rate, high_rate = SPEECH_RATE_NORMAL_RANGE
    if speech_rate > high_rate * 1.5:
        rate_score -= 25
        flags.append("abnormally_fast_speech")
    elif speech_rate < low_rate * 0.5:
        rate_score -= 20
        flags.append("abnormally_slow_speech")
    elif speech_rate > high_rate:
        rate_score -= 10
        flags.append("elevated_speech_rate")

    rate_score = float(np.clip(rate_score, 0, 100))

    # ---- 4. Pause detection ----
    # Identify silent intervals via RMS
    frame_duration = librosa.frames_to_time(1, sr=sr)
    silence_threshold = rms_mean * 0.1
    silent_frames = rms < silence_threshold
    pause_lengths: list[float] = []
    current_pause = 0.0
    for is_silent in silent_frames:
        if is_silent:
            current_pause += frame_duration
        else:
            if current_pause > 0.3:  # ignore very short pauses
                pause_lengths.append(current_pause)
            current_pause = 0.0

    long_pauses = [p for p in pause_lengths if p > PAUSE_DURATION_THRESHOLD]
    details["total_pauses"] = len(pause_lengths)
    details["long_pauses"] = len(long_pauses)
    details["avg_pause_sec"] = round(float(np.mean(pause_lengths)), 2) if pause_lengths else 0.0

    pause_penalty = 0
    if len(long_pauses) > 2:
        pause_penalty = 15
        flags.append("frequent_long_pauses")
    elif len(long_pauses) > 0:
        pause_penalty = 5

    # ---- Combine ----
    voice_stress = (pitch_score * 0.4 + energy_score * 0.3 + (70.0 - pause_penalty) * 0.3)
    voice_stress = float(np.clip(voice_stress, 0, 100))

    combined = (voice_stress + rate_score) / 2

    return VoiceAnalysisResult(
        voice_stress_score=round(voice_stress, 1),
        speech_rate_score=round(rate_score, 1),
        combined_score=round(combined, 1),
        flags=flags,
        details=details,
    )
