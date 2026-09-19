"""Environment management endpoints."""
import json
import logging
import re
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.engine.ingestion import IngestionEngine
from app.models.schemas import CloudEnvironmentDump
from app.config import MAX_UPLOAD_SIZE_BYTES

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/environments", tags=["Environments"])

ENV_ID_REGEX = re.compile(r"^[a-zA-Z0-9_\-\.]+$")


def validate_env_id(env_id: str) -> str:
    """Validates that an environment ID contains only safe alphanumeric/dash/underscore characters."""
    if not env_id or not ENV_ID_REGEX.match(env_id) or ".." in env_id:
        raise HTTPException(status_code=400, detail="Invalid environment identifier format.")
    return env_id


@router.get("", response_model=List[Dict[str, Any]])
def list_environments():
    """Lists all available mock cloud environments."""
    return IngestionEngine.list_available_mock_environments()


@router.get("/{env_id}", response_model=CloudEnvironmentDump)
def get_environment_details(env_id: str):
    """Retrieves full configuration details for a specific mock environment."""
    safe_env_id = validate_env_id(env_id)
    try:
        return IngestionEngine.load_mock_environment_by_id(safe_env_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Environment '{safe_env_id}' not found.")
    except Exception as e:
        logger.error(f"Error loading environment {safe_env_id}: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail="Unable to retrieve environment details.")


@router.post("/upload", response_model=CloudEnvironmentDump)
async def upload_custom_environment(file: UploadFile = File(...)):
    """Accepts a custom synthetic cloud configuration JSON dump."""
    try:
        # Enforce maximum upload size limit to prevent DoS via memory exhaustion
        content = await file.read(MAX_UPLOAD_SIZE_BYTES + 1)
        if len(content) > MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"Uploaded file exceeds maximum allowed limit of {MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)}MB."
            )
        data = json.loads(content.decode("utf-8"))
        return IngestionEngine.parse_environment_dict(data)
    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Uploaded file is not valid JSON format.")
    except ValueError as e:
        logger.warning(f"Validation error processing uploaded environment: {e}")
        raise HTTPException(status_code=422, detail=f"Schema validation error: {e}")
    except Exception as e:
        logger.error(f"Unexpected error processing uploaded environment: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process uploaded cloud configuration.")
