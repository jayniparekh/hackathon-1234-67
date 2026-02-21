import logging
import time

import httpx
from fastapi import APIRouter

from backend.schemas import ThumbnailRequest, ThumbnailResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Thumbnail"])

BEAM_IMAGE_API_URL = "https://z-image-turbo-23b805e-v3.app.beam.cloud"
BEAM_TOKEN = "1GrruQ_gJFrWoGQnwMcumGcjUhiBCRrW6KV21JS8fYOtMNdqecnsOQi65oepvE7qZWd9BnhpP8XbZj2EF_sAVw=="
API_KEY = "zimg_TIyPylVWxjWKLWYqn5fGUl_vsAzH9g8fHvXdmFB4pb0"


@router.post(
    "/thumbnail/generate",
    response_model=ThumbnailResponse,
    summary="Generate thumbnail image",
    description="Calls Beam image API to generate an image from a text prompt.",
)
async def generate_thumbnail(body: ThumbnailRequest):
    logger.info("thumbnail/generate request prompt=%r width=%s height=%s", body.prompt[:80], body.width, body.height)
    logger.info("config: BEAM_IMAGE_API_URL=%s BEAM_TOKEN set=%s API_KEY set=%s", BEAM_IMAGE_API_URL, bool(BEAM_TOKEN), bool(API_KEY))
    headers = {
        "Authorization": f"Bearer {BEAM_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "api_key": API_KEY,
        "prompt": body.prompt,
        "width": body.width,
        "height": body.height,
        "num_inference_steps": body.num_inference_steps,
    }
    if body.reference_image_base64:
        payload["image"] = body.reference_image_base64
    start = time.time()
    try:
        logger.info("calling Beam API %s", BEAM_IMAGE_API_URL)
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(BEAM_IMAGE_API_URL, headers=headers, json=payload)
    except Exception as e:
        logger.exception("Beam API request failed: %s", e)
        return ThumbnailResponse(
            success=False,
            error=str(e),
            duration_seconds=round(time.time() - start, 2),
        )
    duration = round(time.time() - start, 2)
    logger.info("Beam API response status=%s duration=%.2fs", response.status_code, duration)
    if response.status_code != 200:
        logger.warning("Beam API error body: %s", response.text[:1000])
        return ThumbnailResponse(
            success=False,
            error=f"HTTP {response.status_code}: {response.text[:500]}",
            duration_seconds=duration,
        )
    data = response.json()
    if not data.get("success"):
        err = data.get("error", "Unknown API error")
        logger.warning("Beam API success=false error=%s", err)
        return ThumbnailResponse(
            success=False,
            error=err,
            duration_seconds=duration,
        )
    image_b64 = data.get("image")
    if not image_b64:
        logger.warning("Beam API response missing image key")
        return ThumbnailResponse(
            success=False,
            error="No image in response",
            duration_seconds=duration,
        )
    logger.info("thumbnail generated successfully len(image_base64)=%s", len(image_b64))
    return ThumbnailResponse(
        success=True,
        image_base64=image_b64,
        duration_seconds=duration,
    )
