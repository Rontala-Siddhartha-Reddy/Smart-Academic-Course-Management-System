import sys
import json
import asyncio
import edge_tts


VOICE_MAP = {
    "en": ["en-US-JennyNeural", "en-US-GuyNeural"],
    "hi": ["hi-IN-SwaraNeural", "hi-IN-MadhurNeural"],
    "te": ["te-IN-MohanNeural", "te-IN-ShrutiNeural"],
    "ta": ["ta-IN-ValluvarNeural", "ta-IN-PallaviNeural"],
    "kn": ["kn-IN-GaganNeural", "kn-IN-SapnaNeural"],
    "ml": ["ml-IN-MidhunNeural", "ml-IN-SobhanaNeural"],
}


async def generate_audio(text, language_code, output_path):
    voices = VOICE_MAP.get(language_code, VOICE_MAP["en"])
    last_error = ""

    for voice in voices:
        try:
            communicate = edge_tts.Communicate(text=text, voice=voice)
            await communicate.save(output_path)

            print(
                json.dumps(
                    {
                        "success": True,
                        "voice": voice,
                        "outputPath": output_path,
                    },
                    ensure_ascii=False,
                )
            )
            return
        except Exception as error:
            last_error = str(error)

    print(
        json.dumps(
            {
                "success": False,
                "error": last_error,
            },
            ensure_ascii=False,
        )
    )
    sys.exit(1)


def main():
    if len(sys.argv) < 2:
        print(
            json.dumps(
                {
                    "success": False,
                    "error": "Input JSON file path missing",
                }
            )
        )
        sys.exit(1)

    input_json_path = sys.argv[1]

    with open(input_json_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    text = str(data.get("text", "")).strip()
    language_code = str(data.get("languageCode", "en")).strip()
    output_path = str(data.get("outputPath", "")).strip()

    if not text:
        print(
            json.dumps(
                {
                    "success": False,
                    "error": "Text is empty",
                }
            )
        )
        sys.exit(1)

    if not output_path:
        print(
            json.dumps(
                {
                    "success": False,
                    "error": "Output path is empty",
                }
            )
        )
        sys.exit(1)

    asyncio.run(generate_audio(text, language_code, output_path))


if __name__ == "__main__":
    main()