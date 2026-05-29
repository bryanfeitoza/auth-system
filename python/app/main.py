from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth, items
from .config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title='AuthSystem - Python',
    description='Sistema de autenticação com JWT e CRUD',
    version='1.0.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth.router, prefix='/api')
app.include_router(items.router, prefix='/api')


@app.get('/api/health')
def health():
    return {'status': 'ok', 'service': 'python-fastapi'}


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app.main:app', host='0.0.0.0', port=int(settings.PYTHON_PORT))
