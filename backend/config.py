"""
Configuration constants for the Interview Truth Analyzer.
"""

import os

# --- Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'interview_results.db')}"

# --- Analysis Weights (must sum to 1.0) ---
FACIAL_WEIGHT = 0.30
VOICE_WEIGHT = 0.35
NLP_WEIGHT = 0.35

# --- Facial Analysis Thresholds ---
BLINK_RATE_NORMAL_RANGE = (12, 20)     # blinks per minute
GAZE_AVERSION_THRESHOLD = 0.35         # fraction of frames with averted gaze
MICRO_EXPRESSION_THRESHOLD = 0.25

# --- Voice Analysis Thresholds ---
PITCH_JITTER_THRESHOLD = 0.04          # relative jitter
ENERGY_SPIKE_THRESHOLD = 2.0           # std deviations above mean
PAUSE_DURATION_THRESHOLD = 2.0         # seconds
SPEECH_RATE_NORMAL_RANGE = (120, 180)  # words per minute (approximate)

# --- NLP Thresholds ---
HEDGE_WORD_RATIO_THRESHOLD = 0.08      # fraction of words that are hedge words
REPETITION_THRESHOLD = 3               # repeated n-gram count
TYPE_TOKEN_RATIO_LOW = 0.40            # below this = low diversity

# --- Truth Score Classification ---
TRUTH_SCORE_HIGH = 70   # >= this → "Likely Truthful"
TRUTH_SCORE_LOW = 40    # < this → "Potential Deception Indicators"
# Between LOW and HIGH → "Uncertain"

# --- Video Processing ---
FRAME_SAMPLE_RATE = 5  # analyze every Nth frame
MAX_FRAMES = 300       # cap on frames to process
