import os
import httpx
import firebase_admin
from firebase_admin import credentials, auth
from app.core.config import settings


class FreedomBankIntegration:

    def __init__(self):
        if settings.FIREBASE_EMULATOR:
            os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = "127.0.0.1:9099"
            os.environ["FIRESTORE_EMULATOR_HOST"] = "127.0.0.1:8080"

        if not firebase_admin._apps:
            cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT)
            firebase_admin.initialize_app(cred)

        self.base_url = settings.FREEDOM_BANK_URL
        self.api_key = settings.FIREBASE_API_KEY
        self.is_emulator = settings.FIREBASE_EMULATOR

    def create_or_get_user(self, email: str) -> dict:
        try:
            firebase_user = auth.create_user(email=email, password=f"BW_{email}_secure")
        except Exception:
            firebase_user = auth.get_user_by_email(email)

        id_token = self._get_id_token(firebase_user.uid)
        return {
            "firebase_uid": firebase_user.uid,
            "firebase_email": email,
            "id_token": id_token,
        }

    def _get_id_token(self, uid: str) -> str:
        custom_token = auth.create_custom_token(uid)

        if self.is_emulator:
            url = "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key"
        else:
            url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key={self.api_key}"

        response = httpx.post(url, json={
            "token": custom_token.decode("utf-8"),
            "returnSecureToken": True
        })
        response.raise_for_status()
        return response.json()["idToken"]

    def get_account_info(self, id_token: str, account_type: str = "checking") -> dict:
        headers = {"Authorization": f"Bearer {id_token}"}
        response = httpx.get(
            f"{self.base_url}/api",
            params={"account": account_type},
            headers=headers,
            timeout=10.0
        )
        response.raise_for_status()
        return response.json()

    def get_transactions(self, id_token: str, account_type: str = "checking", limit: int = 200, since: str = None) -> list:
        headers = {"Authorization": f"Bearer {id_token}"}
        params = {"account": account_type, "limit": limit}
        if since:
            params["since"] = since
        response = httpx.get(
            f"{self.base_url}/api/transactions",
            params=params,
            headers=headers,
            timeout=10.0
        )
        response.raise_for_status()
        return response.json().get("items", [])

    def tick(self, id_token: str, account_type: str = "checking") -> dict:
        headers = {"Authorization": f"Bearer {id_token}"}
        response = httpx.get(
            f"{self.base_url}/tick",
            params={"account": account_type},
            headers=headers,
            timeout=10.0
        )
        response.raise_for_status()
        return response.json()