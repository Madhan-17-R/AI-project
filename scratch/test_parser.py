import sys
sys.path.insert(0, 'backend')
from app.services.serial_manager import parse_json_line

raw = '{"device_id":"FIELD_001","timestamp":null,"soil_moisture":45.2,"soil_temperature":25.4,"soil_ph":null,"soil_ec":null,"air_temperature":30.1,"humidity":60.5,"light_lux":1000,"sensor_status":{"soil_moisture":"ok","soil_temperature":"ok","soil_ph":"unavailable","soil_ec":"unavailable","air_temperature":"ok","humidity":"ok","light_lux":"ok"}}\r\n'

pkt = parse_json_line(raw)
if pkt:
    print('Parsed:', pkt.model_dump())
else:
    print('Failed to parse')
