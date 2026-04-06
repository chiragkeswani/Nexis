"""
Facial Expression & Eye Tracking Analyzer
Uses OpenCV and MediaPipe to analyze video frames for:
  - Facial micro-expressions (brow/lip displacement)
  - Eye movement patterns (gaze aversion, blink rate)
"""

import cv2
import numpy as np
import mediapipe as mp
from schemas import FacialAnalysisResult
from config import (
    FRAME_SAMPLE_RATE,
    MAX_FRAMES,
    BLINK_RATE_NORMAL_RANGE,
    GAZE_AVERSION_THRESHOLD,
    MICRO_EXPRESSION_THRESHOLD,
)


# MediaPipe Face Mesh landmark indices
LEFT_EYE_TOP = 159
LEFT_EYE_BOTTOM = 145
LEFT_EYE_LEFT = 33
LEFT_EYE_RIGHT = 133
RIGHT_EYE_TOP = 386
RIGHT_EYE_BOTTOM = 374
RIGHT_EYE_LEFT = 362
RIGHT_EYE_RIGHT = 263
LEFT_IRIS = 468      # iris center (requires refine_landmarks)
RIGHT_IRIS = 473
LEFT_BROW = 70
RIGHT_BROW = 300
UPPER_LIP = 13
LOWER_LIP = 14
NOSE_TIP = 1


def _eye_aspect_ratio(landmarks, top, bottom, left, right) -> float:
    """Compute Eye Aspect Ratio (EAR) for blink detection."""
    vertical = np.linalg.norm(
        np.array([landmarks[top].x, landmarks[top].y])
        - np.array([landmarks[bottom].x, landmarks[bottom].y])
    )
    horizontal = np.linalg.norm(
        np.array([landmarks[left].x, landmarks[left].y])
        - np.array([landmarks[right].x, landmarks[right].y])
    )
    return vertical / max(horizontal, 1e-6)


def _gaze_deviation(landmarks) -> float:
    """Estimate gaze deviation from center using iris vs eye corners."""
    try:
        left_iris = np.array([landmarks[LEFT_IRIS].x, landmarks[LEFT_IRIS].y])
        left_center = (
            np.array([landmarks[LEFT_EYE_LEFT].x, landmarks[LEFT_EYE_LEFT].y])
            + np.array([landmarks[LEFT_EYE_RIGHT].x, landmarks[LEFT_EYE_RIGHT].y])
        ) / 2
        deviation = np.linalg.norm(left_iris - left_center)
        return float(deviation)
    except (IndexError, AttributeError):
        return 0.0


def _brow_displacement(landmarks) -> float:
    """Measure brow height relative to nose tip (proxy for surprise/stress)."""
    left_brow = np.array([landmarks[LEFT_BROW].x, landmarks[LEFT_BROW].y])
    right_brow = np.array([landmarks[RIGHT_BROW].x, landmarks[RIGHT_BROW].y])
    nose = np.array([landmarks[NOSE_TIP].x, landmarks[NOSE_TIP].y])
    avg_brow = (left_brow + right_brow) / 2
    return float(np.linalg.norm(avg_brow - nose))


def _lip_displacement(landmarks) -> float:
    """Measure lip opening (proxy for micro-expression)."""
    upper = np.array([landmarks[UPPER_LIP].x, landmarks[UPPER_LIP].y])
    lower = np.array([landmarks[LOWER_LIP].x, landmarks[LOWER_LIP].y])
    return float(np.linalg.norm(upper - lower))


def analyze_video(video_path: str) -> FacialAnalysisResult:
    """
    Analyze a video file and return facial/eye-tracking scores.

    Parameters
    ----------
    video_path : str
        Path to the uploaded video file.

    Returns
    -------
    FacialAnalysisResult
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return FacialAnalysisResult(
            expression_score=50.0,
            eye_movement_score=50.0,
            combined_score=50.0,
            flags=["video_unreadable"],
            details={"error": "Could not open video file"},
        )

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    face_mesh = mp.solutions.face_mesh.FaceMesh(
        static_image_mode=False,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    ear_values: list[float] = []
    gaze_deviations: list[float] = []
    brow_displacements: list[float] = []
    lip_displacements: list[float] = []
    blink_count = 0
    prev_ear = 1.0
    blink_threshold = 0.21
    frame_idx = 0
    processed_frames = 0

    while True:
        ret, frame = cap.read()
        if not ret or processed_frames >= MAX_FRAMES:
            break

        frame_idx += 1
        if frame_idx % FRAME_SAMPLE_RATE != 0:
            continue

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_frame)

        if results.multi_face_landmarks:
            lm = results.multi_face_landmarks[0].landmark

            # Eye Aspect Ratio
            left_ear = _eye_aspect_ratio(lm, LEFT_EYE_TOP, LEFT_EYE_BOTTOM, LEFT_EYE_LEFT, LEFT_EYE_RIGHT)
            right_ear = _eye_aspect_ratio(lm, RIGHT_EYE_TOP, RIGHT_EYE_BOTTOM, RIGHT_EYE_LEFT, RIGHT_EYE_RIGHT)
            avg_ear = (left_ear + right_ear) / 2
            ear_values.append(avg_ear)

            # Blink detection (EAR drop below threshold)
            if prev_ear >= blink_threshold and avg_ear < blink_threshold:
                blink_count += 1
            prev_ear = avg_ear

            # Gaze
            gaze_deviations.append(_gaze_deviation(lm))

            # Expressions
            brow_displacements.append(_brow_displacement(lm))
            lip_displacements.append(_lip_displacement(lm))

        processed_frames += 1

    cap.release()
    face_mesh.close()

    # ---- Compute scores ----
    flags: list[str] = []
    details: dict = {}
    total_duration_sec = (frame_idx / fps) if fps > 0 else 1.0

    # --- Eye movement score ---
    eye_score = 70.0  # default: neutral-good
    if gaze_deviations:
        avg_gaze = float(np.mean(gaze_deviations))
        gaze_std = float(np.std(gaze_deviations))
        details["avg_gaze_deviation"] = round(avg_gaze, 4)
        details["gaze_deviation_std"] = round(gaze_std, 4)

        # High average gaze deviation → aversion
        if avg_gaze > GAZE_AVERSION_THRESHOLD:
            eye_score -= 25
            flags.append("frequent_gaze_aversion")

        # High variance → erratic movement
        if gaze_std > 0.05:
            eye_score -= 15
            flags.append("irregular_eye_movement")

    # Blink rate
    blinks_per_min = (blink_count / total_duration_sec) * 60 if total_duration_sec > 0 else 0
    details["blink_rate_per_min"] = round(blinks_per_min, 1)
    details["total_blinks"] = blink_count

    low, high = BLINK_RATE_NORMAL_RANGE
    if blinks_per_min > high * 1.5:
        eye_score -= 15
        flags.append("excessive_blinking")
    elif blinks_per_min < low * 0.5:
        eye_score -= 10
        flags.append("unusually_low_blink_rate")

    eye_score = float(np.clip(eye_score, 0, 100))

    # --- Expression score ---
    expression_score = 70.0
    if brow_displacements:
        brow_std = float(np.std(brow_displacements))
        lip_std = float(np.std(lip_displacements))
        details["brow_variability"] = round(brow_std, 4)
        details["lip_variability"] = round(lip_std, 4)

        # Very high variability may indicate stress / micro-expressions
        if brow_std > MICRO_EXPRESSION_THRESHOLD:
            expression_score -= 15
            flags.append("elevated_brow_activity")
        if lip_std > MICRO_EXPRESSION_THRESHOLD:
            expression_score -= 10
            flags.append("elevated_lip_activity")

        # Very low variability → flat affect / rehearsed
        if brow_std < 0.005 and lip_std < 0.005:
            expression_score -= 10
            flags.append("flat_affect")

    expression_score = float(np.clip(expression_score, 0, 100))
    combined = (expression_score + eye_score) / 2

    details["frames_processed"] = processed_frames
    details["video_duration_sec"] = round(total_duration_sec, 1)

    return FacialAnalysisResult(
        expression_score=round(expression_score, 1),
        eye_movement_score=round(eye_score, 1),
        combined_score=round(combined, 1),
        flags=flags,
        details=details,
    )
