from sqlmodel import create_engine, SQLModel, Session
import os

sqlite_file_name = "database.db"

# Asegurarse de que el directorio exista
db_dir = os.path.join(os.path.dirname(__file__), "sqlite")
os.makedirs(db_dir, exist_ok=True)

sqlite_url = f"sqlite:///{db_dir}/{sqlite_file_name}"
engine = create_engine(sqlite_url, echo=True)  

sesion = Session(engine)

def create_db_and_tables():  
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

