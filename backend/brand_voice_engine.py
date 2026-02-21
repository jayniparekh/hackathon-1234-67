"""
Brand Voice DNA Engine
Powered by Gemini 2.5 Flash Lite

Enables:
- Extracting a brand's "voice DNA" from a corpus of articles
- Scoring new content against a brand voice profile
- Auto-correcting content to align with brand voice
"""

import os
import json
import re
from typing import List, Dict, Optional
from dataclasses import dataclass, field, asdict

import google.generativeai as genai


# ── Configure Gemini ────────────────────────────────────────────────────────
def _get_gemini_model():
    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "No Gemini API key found. Set the GOOGLE_API_KEY environment variable."
        )
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.5-flash-lite-preview-06-17")


# ── Data Structures ─────────────────────────────────────────────────────────
@dataclass
class BrandVoiceProfile:
    name: str
    tone_dimensions: Dict[str, float] = field(default_factory=dict)
    # e.g. {"formal": 0.8, "persuasive": 0.6, "empathetic": 0.3, "humorous": 0.1}

    vocabulary_level: str = "professional"
    # simple | conversational | professional | technical | academic

    avg_sentence_length: str = "medium"
    # short (<12 words) | medium (12-20) | long (>20)

    brand_personality: List[str] = field(default_factory=list)
    # e.g. ["data-driven", "humble", "technical"]

    signature_phrases: List[str] = field(default_factory=list)
    # recurring linguistic patterns

    writing_style_notes: str = ""

    article_count: int = 0


@dataclass
class BrandScoreResult:
    overall_match: int          # 0-100
    dimension_scores: Dict[str, int] = field(default_factory=dict)
    strengths: List[str] = field(default_factory=list)
    deviations: List[str] = field(default_factory=list)
    verdict: str = ""           # e.g. "On-brand", "Slight drift", "Off-brand"


@dataclass
class BrandCorrectionResult:
    original_text: str
    corrected_text: str
    original_score: int
    corrected_score: int
    changes_made: List[str] = field(default_factory=list)
    explanation: str = ""


# ── Engine ──────────────────────────────────────────────────────────────────
class BrandVoiceEngine:
    """
    Core Brand Voice DNA engine.
    Uses Gemini 2.5 Flash Lite to extract brand profiles, score content,
    and auto-correct text toward a target brand voice.
    """

    def __init__(self):
        self._model = None  # lazy-loaded

    @property
    def model(self):
        if self._model is None:
            self._model = _get_gemini_model()
        return self._model

    # ── Profile Creation ────────────────────────────────────────────────────
    def extract_brand_dna(self, articles: List[str], profile_name: str) -> BrandVoiceProfile:
        """
        Analyze a corpus of articles and extract the brand voice DNA.

        Args:
            articles: List of article texts (minimum 1, ideally 3+)
            profile_name: Name for this brand profile

        Returns:
            BrandVoiceProfile dataclass
        """
        corpus = "\n\n---ARTICLE BREAK---\n\n".join(
            [f"ARTICLE {i+1}:\n{a.strip()}" for i, a in enumerate(articles[:10])]
        )

        prompt = f"""You are a brand voice analyst. Analyze the following articles and extract a precise brand voice DNA profile.

{corpus}

Return ONLY valid JSON (no markdown, no code fences) with this exact schema:
{{
  "tone_dimensions": {{
    "formal": <0.0-1.0>,
    "casual": <0.0-1.0>,
    "persuasive": <0.0-1.0>,
    "empathetic": <0.0-1.0>,
    "authoritative": <0.0-1.0>,
    "humorous": <0.0-1.0>,
    "data_driven": <0.0-1.0>,
    "inspirational": <0.0-1.0>
  }},
  "vocabulary_level": "<simple|conversational|professional|technical|academic>",
  "avg_sentence_length": "<short|medium|long>",
  "brand_personality": ["<trait1>", "<trait2>", "<trait3>"],
  "signature_phrases": ["<phrase1>", "<phrase2>", "<phrase3>"],
  "writing_style_notes": "<2-3 sentence description of the distinctive writing style>"
}}"""

        response = self.model.generate_content(prompt)
        raw = response.text.strip()

        # strip any accidental markdown fences
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw)

        data = json.loads(raw)

        return BrandVoiceProfile(
            name=profile_name,
            tone_dimensions=data.get("tone_dimensions", {}),
            vocabulary_level=data.get("vocabulary_level", "professional"),
            avg_sentence_length=data.get("avg_sentence_length", "medium"),
            brand_personality=data.get("brand_personality", []),
            signature_phrases=data.get("signature_phrases", []),
            writing_style_notes=data.get("writing_style_notes", ""),
            article_count=len(articles),
        )

    # ── Content Scoring ─────────────────────────────────────────────────────
    def score_content(self, text: str, profile: BrandVoiceProfile) -> BrandScoreResult:
        """
        Score how well a piece of content matches the brand voice profile.

        Args:
            text: Content to score
            profile: BrandVoiceProfile to compare against

        Returns:
            BrandScoreResult with overall % and per-dimension breakdown
        """
        profile_summary = json.dumps(asdict(profile), indent=2)

        prompt = f"""You are a brand voice expert. Score this content against the brand voice profile below.

BRAND VOICE PROFILE:
{profile_summary}

CONTENT TO SCORE:
{text}

Return ONLY valid JSON with this exact schema:
{{
  "overall_match": <0-100 integer>,
  "dimension_scores": {{
    "tone_alignment": <0-100>,
    "vocabulary_match": <0-100>,
    "sentence_style": <0-100>,
    "personality_match": <0-100>
  }},
  "strengths": ["<what matches well 1>", "<what matches well 2>"],
  "deviations": ["<specific deviation 1>", "<specific deviation 2>"],
  "verdict": "<On-brand|Mostly on-brand|Slight drift|Off-brand|Strongly off-brand>"
}}"""

        response = self.model.generate_content(prompt)
        raw = response.text.strip()
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw)

        data = json.loads(raw)

        return BrandScoreResult(
            overall_match=int(data.get("overall_match", 0)),
            dimension_scores=data.get("dimension_scores", {}),
            strengths=data.get("strengths", []),
            deviations=data.get("deviations", []),
            verdict=data.get("verdict", ""),
        )

    # ── Auto-Correction ─────────────────────────────────────────────────────
    def auto_correct(self, text: str, profile: BrandVoiceProfile) -> BrandCorrectionResult:
        """
        Rewrite content to align with the brand voice profile.

        Args:
            text: Content to correct
            profile: BrandVoiceProfile to align toward

        Returns:
            BrandCorrectionResult with original, corrected text, scores, and change log
        """
        profile_summary = json.dumps(asdict(profile), indent=2)

        prompt = f"""You are a brand voice editor. Rewrite the content below to perfectly match the brand voice profile.

BRAND VOICE PROFILE:
{profile_summary}

ORIGINAL CONTENT:
{text}

Rules:
- Keep the same core meaning and information
- Adjust tone, vocabulary, sentence length, and personality to match the profile
- Do not add facts that weren't in the original

Return ONLY valid JSON with this exact schema:
{{
  "corrected_text": "<the rewritten content>",
  "changes_made": [
    "<specific change 1>",
    "<specific change 2>",
    "<specific change 3>"
  ],
  "explanation": "<1-2 sentences explaining the overall approach taken>"
}}"""

        response = self.model.generate_content(prompt)
        raw = response.text.strip()
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw)

        data = json.loads(raw)
        corrected_text = data.get("corrected_text", text)

        # Score both original and corrected
        original_score_result = self.score_content(text, profile)
        corrected_score_result = self.score_content(corrected_text, profile)

        return BrandCorrectionResult(
            original_text=text,
            corrected_text=corrected_text,
            original_score=original_score_result.overall_match,
            corrected_score=corrected_score_result.overall_match,
            changes_made=data.get("changes_made", []),
            explanation=data.get("explanation", ""),
        )


# ── In-memory Profile Store ─────────────────────────────────────────────────
class ProfileStore:
    """Simple in-memory store for brand voice profiles."""

    def __init__(self):
        self._profiles: Dict[str, BrandVoiceProfile] = {}

    def save(self, profile: BrandVoiceProfile) -> None:
        self._profiles[profile.name] = profile

    def get(self, name: str) -> Optional[BrandVoiceProfile]:
        return self._profiles.get(name)

    def list_names(self) -> List[str]:
        return list(self._profiles.keys())

    def delete(self, name: str) -> bool:
        if name in self._profiles:
            del self._profiles[name]
            return True
        return False

    def all_profiles(self) -> List[Dict]:
        return [
            {
                "name": p.name,
                "article_count": p.article_count,
                "vocabulary_level": p.vocabulary_level,
                "brand_personality": p.brand_personality,
                "writing_style_notes": p.writing_style_notes,
            }
            for p in self._profiles.values()
        ]


# Singleton store shared across the app
profile_store = ProfileStore()
brand_voice_engine = BrandVoiceEngine()
