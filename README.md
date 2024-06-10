# streamlit-copilot-textarea

a drop-in replacement for the standard streamlit textarea, offering enhanced autocomplete features powered by AI.

![](docs/streamlit-copilot-textarea.gif)

## Installation

```bash
pip install streamlit-copilot-textarea
```

## Usage

```python
from streamlit_copilot_textarea import st_copilot_textarea

value = st_copilot_textarea(
    prompt_template="please complete the text: {input_text}",
    api_url="http://localhost:8000/generate",
    requests_per_minute=20,
    max_tokens=10,
    stop=["\n", "."],
)

st.write(f"Your text: {value}")
```

- `prompt_template`: the prompt template to be sent to the api. It must contain `{input_text}`, which will be replaced by the user input.
- `api_url`: the url of the api to be used (see below for sever).
- `requests_per_minute`: the number of requests per minute to be made to the api.
- `max_tokens`: the maximum number of tokens to be generated.
- `stop`: the tokens where the generation should stop.

[server.py](./server.py): fastapi example

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Payload(BaseModel):
    prompt: str
    # Add other fields that might be part of model_kwargs
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None

@app.post("/generate")
async def generate(payload: Payload):
    # here the prompt's {input_text} is already replaced with the user input.
    prompt = payload.prompt
    completion_text = request_chatgpt_here(prompt, payload.temperature, payload.max_tokens)
    response = {"choices": [{"text": completion_text}]}
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

test your copilot api

```sh
curl -X POST "http://localhost:8000/generate" -H "Content-Type: application/json" -d '{"prompt": "please complete the text: Human and AI", "temperature": 0.5, "max_tokens": 10}'
```

## Buiding from source

### Prerequisites

- nodejs >= 18.x
- yarn >= 1.22.x
- poetry >= 1.2.x
- python >= 3.8.x

### Building

```bash
./build.sh
```

### Publishing

```bash
poetry publish
```

## Thanks

- [streamlit-copilot](https://github.com/sobkevich/streamlit-copilot)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
