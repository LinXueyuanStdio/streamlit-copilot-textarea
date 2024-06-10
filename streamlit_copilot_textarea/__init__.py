import os

import streamlit.components.v1 as components


_RELEASE = True
COMPONENT_NAME = "streamlit_copilot_textarea"

# use the build instead of development if release is true
if _RELEASE:
    root_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(root_dir, "frontend/build")

    _streamlit_copilot_textarea = components.declare_component(COMPONENT_NAME, path=build_dir)
else:
    _streamlit_copilot_textarea = components.declare_component(COMPONENT_NAME, url="http://localhost:3001")


def st_copilot_textarea(
    prompt_template: str,
    api_url: str,
    requests_per_minute=20,
    height: int = 100,
    font_family: str = "Helvetica",
    **model_kwargs
):
    """

    Args:
        prompt_template (str): f-string template for the prompt
        api_url (str): URL of the API
        rpm_limit (int, optional): limit. Defaults to 100.
        height (int, optional): height. Defaults to 100.
        font_family (str, optional): font. Defaults to "Helvetica".

    Returns:
        _type_: _description_
    """
    if requests_per_minute is None:
        requests_per_minute = 20
    return _streamlit_copilot_textarea(
        prompt_template=prompt_template,
        api_url=api_url,
        requests_per_minute=requests_per_minute,
        height=height,
        font_family=font_family,
        default=None,
        **model_kwargs,
    )
