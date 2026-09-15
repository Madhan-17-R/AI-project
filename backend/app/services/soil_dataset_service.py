import csv
import os
import statistics
from typing import Dict, Optional, Tuple
from app.utils.logger import get_logger

logger = get_logger("soil_dataset_service")

# Cache: { crop_name: (median_ph, median_ec) }
_crop_reference_cache: Dict[str, Tuple[float, float]] = {}
_is_loaded = False

def _normalize_label(label: str) -> str:
    """Normalize crop labels to lowercase for robust matching."""
    return label.strip().lower()

def load_dataset(filepath: str = "data/soil_dataset.csv"):
    """
    Load the static soil dataset and calculate the median pH and EC per crop.
    This serves as the stable reference baseline for the crop without generating fake variance.
    """
    global _crop_reference_cache, _is_loaded
    
    if _is_loaded:
        return
        
    if not os.path.exists(filepath):
        # Allow relative to backend root
        alt_path = os.path.join(os.getcwd(), filepath)
        if not os.path.exists(alt_path):
            logger.warning(f"Soil dataset not found at {filepath}. Reference values will be unavailable.")
            _is_loaded = True
            return
        filepath = alt_path

    crop_data = {}
    
    try:
        with open(filepath, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            # Validate headers
            if not reader.fieldnames:
                logger.error("Empty CSV file")
                return
            
            required = {"ph", "EC", "label"}
            if not required.issubset(set(reader.fieldnames)):
                logger.error(f"Missing required columns in dataset. Expected {required}, found {reader.fieldnames}")
                return
                
            for row in reader:
                label = row.get("label")
                ph_str = row.get("ph")
                ec_str = row.get("EC")
                
                if not label or not ph_str or not ec_str:
                    continue
                    
                crop_name = _normalize_label(label)
                
                try:
                    ph_val = float(ph_str)
                    ec_val = float(ec_str)
                    
                    if crop_name not in crop_data:
                        crop_data[crop_name] = {"ph": [], "ec": []}
                        
                    crop_data[crop_name]["ph"].append(ph_val)
                    crop_data[crop_name]["ec"].append(ec_val)
                except ValueError:
                    continue
                    
        # Calculate Medians
        for crop, data in crop_data.items():
            if data["ph"] and data["ec"]:
                med_ph = round(statistics.median(data["ph"]), 2)
                med_ec = round(statistics.median(data["ec"]), 2)
                _crop_reference_cache[crop] = (med_ph, med_ec)
                
        _is_loaded = True
        logger.info(f"Loaded soil reference dataset for {len(_crop_reference_cache)} crops.")
        
    except Exception as e:
        logger.error(f"Failed to load soil dataset: {e}")

def get_crop_soil_reference(crop_id: str) -> Tuple[Optional[float], Optional[float]]:
    """
    Returns the (median_ph, median_ec) for a given crop, or (None, None) if unknown.
    """
    if not _is_loaded:
        load_dataset()
        
    if not crop_id:
        return None, None
        
    crop_name = _normalize_label(crop_id)
    return _crop_reference_cache.get(crop_name, (None, None))
