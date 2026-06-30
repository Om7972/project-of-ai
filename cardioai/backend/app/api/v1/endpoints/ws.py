import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.redis_service import get_redis

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, message: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


@router.websocket("/triage")
async def triage_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    redis = await get_redis()
    pubsub = None

    try:
        if redis:
            pubsub = redis.pubsub()
            await pubsub.subscribe("triage_updates")

        while True:
            if pubsub:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message.get("data"):
                    try:
                        data = json.loads(message["data"])
                        await websocket.send_json(data)
                    except Exception:
                        pass
            else:
                await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket)
        if pubsub:
            await pubsub.unsubscribe("triage_updates")
            await pubsub.close()
