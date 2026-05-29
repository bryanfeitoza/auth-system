import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(env_path)


class Settings:
    DB_USER: str = os.getenv('DB_USER', 'auth_user')
    DB_PASS: str = os.getenv('DB_PASS', 'auth_password')
    DB_NAME: str = os.getenv('DB_NAME', 'auth_system')
    DB_HOST: str = os.getenv('DB_HOST', 'localhost')
    DB_PORT: str = os.getenv('DB_PORT', '5432')

    JWT_SECRET: str = os.environ['JWT_SECRET']
    JWT_ALGORITHM: str = 'HS256'
    JWT_EXPIRES_IN: int = 7 * 24 * 60 * 60

    PYTHON_PORT: int = int(os.getenv('PYTHON_PORT', '8000'))

    DATABASE_URL: str = f'postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}'


settings = Settings()
