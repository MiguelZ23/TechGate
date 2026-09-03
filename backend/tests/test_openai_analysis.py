from app.openai_analysis import _data_url, _extract_output_text


def test_data_url_encodes_image_bytes():
    assert _data_url(b"hello", "image/png") == "data:image/png;base64,aGVsbG8="


def test_extract_output_text_from_raw_response_shape():
    response = {
        "output": [
            {
                "type": "message",
                "content": [{"type": "output_text", "text": '{"risk_level":"low"}'}],
            }
        ]
    }
    assert _extract_output_text(response) == '{"risk_level":"low"}'
