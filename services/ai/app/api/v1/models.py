from typing import List
from fastapi import APIRouter
from app.core.models import get_registered_models, AIModelRegistryEntry

router = APIRouter()


@router.get("/models", response_model=List[AIModelRegistryEntry])
def list_models():
    return get_registered_models()
