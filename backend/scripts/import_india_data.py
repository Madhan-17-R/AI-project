import os
import sys
import csv
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("import_india_data")

def main():
    # Load environment variables
    env_path = Path(__file__).parent.parent / '.env'
    load_dotenv(env_path)

    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        logger.error("Supabase credentials missing. Check .env file.")
        sys.exit(1)

    supabase: Client = create_client(supabase_url, supabase_key)
    data_dir = Path(__file__).parent.parent.parent / 'data' / 'india'
    
    if not data_dir.exists():
        logger.error(f"Data directory not found: {data_dir}")
        sys.exit(1)

    # Helper function to read and upsert
    def upsert_csv(filename, table_name, index_cols=None):
        filepath = data_dir / filename
        if not filepath.exists():
            logger.warning(f"File not found: {filename}")
            return 0
        
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            rows = []
            for row in reader:
                # Convert empty strings to None (null in db)
                cleaned_row = {k: (v if v.strip() != "" else None) for k, v in row.items()}
                rows.append(cleaned_row)
        
        if not rows:
            return 0

        # Upsert in batches of 1000
        batch_size = 1000
        count = 0
        for i in range(0, len(rows), batch_size):
            batch = rows[i:i+batch_size]
            try:
                # The supabase-py upsert doesn't require returning everything.
                res = supabase.table(table_name).upsert(batch).execute()
                count += len(res.data) if res.data else len(batch)
            except Exception as e:
                logger.error(f"Error upserting to {table_name}: {e}")
        
        logger.info(f"Upserted {count} rows into {table_name}")
        return count

    # Order is important due to foreign keys
    upsert_csv('source_registry.csv', 'india_source_registry')
    upsert_csv('india_locations.csv', 'india_locations')
    upsert_csv('district_crops_provisional.csv', 'india_district_crops')
    upsert_csv('district_irrigation_provisional.csv', 'india_district_irrigation')
    upsert_csv('district_water.csv', 'india_district_water')
    upsert_csv('district_languages.csv', 'india_district_languages')

    logger.info("Import completed.")

if __name__ == "__main__":
    main()
