"""Three-stage binary-to-character conversion pipeline endpoint."""

import math
from fastapi import APIRouter, HTTPException
from api.schemas.password_schema import BinaryConversionRequest
from password_engine.character_mapping import CharacterMap
from quantum_engine.random_bits import quantum_bit_generator
from utils.response_formatter import success_response

router = APIRouter(prefix="/api/conversion", tags=["Binary Conversion"])


@router.post("/convert")
async def convert_binary_stream(request: BinaryConversionRequest):
    """
    Executes a three-stage conversion pipeline:
    Stage 1: Raw quantum binary stream analysis.
    Stage 2: Chunking into integer candidates and unbiased rejection sampling.
    Stage 3: Mapping accepted integers into characters and encoding modes.
    """
    try:
        raw_bits = request.binary_string
        if not raw_bits:
            gen_res = quantum_bit_generator.generate_quantum_bits(request.bit_count)
            raw_bits = gen_res["bits"]

        # Validate that string is purely binary
        if not all(b in "01" for b in raw_bits):
            raise ValueError("Binary string must contain only '0' and '1' characters.")

        # Default pool: uppercase + lowercase + numbers + symbols
        pool, _ = CharacterMap.build_character_pool(True, True, True, True)
        pool_size = len(pool)
        chunk_size = request.chunk_size if (2 <= request.chunk_size <= 16) else math.ceil(math.log2(pool_size))

        # Stage 1: Tokens
        stage1_bits = [
            {
                "index": i,
                "bit": b,
                "color": "#00F0FF" if b == "0" else "#8A2BE2",
                "label": "|0⟩" if b == "0" else "|1⟩",
            }
            for i, b in enumerate(raw_bits[:128])
        ]

        # Stage 2: Integer candidate chunks & rejection sampling
        stage2_chunks = []
        accepted_candidates = []
        rejected_candidates = []
        resulting_characters = []

        for i in range(0, len(raw_bits) - chunk_size + 1, chunk_size):
            chunk = raw_bits[i:i + chunk_size]
            candidate_val = int(chunk, 2)
            hex_val = hex(candidate_val)[2:].upper().zfill(max(1, chunk_size // 4))

            is_accepted = candidate_val < pool_size
            mapped_char = pool[candidate_val] if is_accepted else None
            mapped_cat = CharacterMap.get_category_of_char(mapped_char) if mapped_char else None

            item = {
                "chunk_index": len(stage2_chunks),
                "start_bit": i,
                "end_bit": i + chunk_size,
                "binary": chunk,
                "decimal": candidate_val,
                "hex": f"0x{hex_val}",
                "accepted": is_accepted,
                "mapped_char": mapped_char,
                "category": mapped_cat,
                "status": "ACCEPTED" if is_accepted else "REJECTED (MODULO BIAS PREVENTION)",
            }
            stage2_chunks.append(item)

            if is_accepted:
                accepted_candidates.append(candidate_val)
                resulting_characters.append(mapped_char)
            else:
                rejected_candidates.append(candidate_val)

        final_password = "".join(resulting_characters)

        # Stage 3: Multi-format representations
        encodings = {
            "binary_stream": raw_bits[:256],
            "decimal_values": accepted_candidates[:32],
            "hex_stream": "".join([f"{c:02X}" for c in accepted_candidates[:32]]),
            "ascii_password": final_password,
            "raw_ascii_chunks": [chr(int(raw_bits[j:j+8], 2)) for j in range(0, min(len(raw_bits), 256) - 7, 8) if 32 <= int(raw_bits[j:j+8], 2) <= 126],
        }

        total_chunks = len(stage2_chunks)
        rejection_rate = round((len(rejected_candidates) / total_chunks * 100), 2) if total_chunks > 0 else 0.0

        stats = {
            "total_bits": len(raw_bits),
            "chunk_size": chunk_size,
            "total_chunks_processed": total_chunks,
            "accepted_count": len(accepted_candidates),
            "rejected_count": len(rejected_candidates),
            "rejection_rate_percent": rejection_rate,
            "character_pool_size": pool_size,
            "resulting_password_length": len(final_password),
            "bits_per_character": round(len(raw_bits) / max(1, len(final_password)), 2),
        }

        data = {
            "stage1_tokens": stage1_bits,
            "stage2_chunks": stage2_chunks[:40],
            "stage3_password": final_password,
            "encodings": encodings,
            "stats": stats,
            "methodology_explanation": (
                "Unbiased rejection sampling guarantees that each allowed character has an identical, "
                "uniform selection probability. Modulo mapping (chunk % pool_size) would introduce systematic bias "
                "toward smaller indices because 2^k is rarely an exact multiple of the character set size N."
            ),
        }

        return success_response(data=data, message="Conversion pipeline completed successfully.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion error: {str(e)}")
