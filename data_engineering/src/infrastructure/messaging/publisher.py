import os
import asyncio
from bullmq import Queue

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

queue = Queue("alerts_queue", {"connection": {"host": REDIS_HOST, "port": REDIS_PORT}})

async def publish_price_alert(commodity_id: int, current_price: float, variation: float):
    """Envia um evento de alteração de preço para a fila do Redis (BullMQ)."""
    job_data = {
        "commodity_id": commodity_id,
        "current_price": current_price,
        "variation": variation
    }
    
    job = await queue.add("price_alert_triggered", job_data)
    print(f"Job {job.id} publicado na fila para a commodity ID {commodity_id}: R$ {current_price} (variação de {variation}%)")

if __name__ == "__main__":
    asyncio.run(publish_price_alert(1, 45.50, -2.5))
