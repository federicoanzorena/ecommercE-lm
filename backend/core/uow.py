from sqlmodel import Session


class UnitOfWork:
    def __init__(self, session: Session) -> None:
        self.session = session

    def __enter__(self) -> "UnitOfWork":
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        if exc_type is None:
            self.session.commit()
        else:
            self.session.rollback()
