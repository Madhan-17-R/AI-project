import pytest
import asyncio
from unittest.mock import patch, MagicMock
from app.services import supabase_service, india_context_service

def test_india_context_resolution():
    async def run_test():
        with patch("app.services.india_context_service.supabase_service") as mock_supabase_service:
            mock_client = MagicMock()
            mock_supabase_service.get_client.return_value = mock_client
            
            # Mock farm data for Thanjavur, Tamil Nadu
            farm_data = {
                "data": [{
                    "device_id": "TEST_01",
                    "state": "Tamil Nadu",
                    "district": "Thanjavur",
                    "crop_id": "Rice",
                    "soil_type": "Clay",
                    "climate_zone": None,
                    "irrigation_method": None,
                    "irrigation_source": None
                }]
            }
            mock_client.table().select().eq().execute.return_value = MagicMock(data=farm_data["data"])
            
            def side_effect_table(table_name):
                mock_table = MagicMock()
                if table_name == "farms":
                    mock_table.select().eq().execute.return_value = MagicMock(data=farm_data["data"])
                elif table_name == "india_locations":
                    mock_table.select().eq().eq().execute.return_value = MagicMock(data=[{"state_code": "33", "district_code": "613"}])
                elif table_name == "india_district_crops":
                    mock_table.select().eq().eq().eq().execute.return_value = MagicMock(data=[{"data_status": "PROVISIONAL_STATE_PROFILE"}])
                elif table_name == "india_district_irrigation":
                    mock_table.select().eq().eq().execute.return_value = MagicMock(data=[{"primary_irrigation_method": "Canal", "primary_water_source": "Surface Water", "data_status": "OFFICIAL_DISTRICT_AGGREGATE"}])
                elif table_name == "india_district_water":
                    mock_table.select().eq().eq().execute.return_value = MagicMock(data=[{"derived_stage_class": "SAFE"}])
                elif table_name == "india_district_languages":
                    mock_table.select().eq().eq().execute.return_value = MagicMock(data=[{"major_language": "TAMIL", "mother_tongue": "Tamil"}])
                return mock_table
                
            mock_client.table.side_effect = side_effect_table
            
            context = await india_context_service.get_context_for_device("TEST_01")
            
            assert context["state"] == "Tamil Nadu"
            assert context["district"] == "Thanjavur"
            assert context["crop"] == "Rice"
            assert context["soil_type"] == "Clay"  # Farm override
            assert context["irrigation_method"] == "Canal" # District default
            assert context["water_availability_class"] == "SAFE"
            assert context["major_language"] == "TAMIL"
            assert context["context_status"] == "provisional_crop"

    asyncio.run(run_test())
