"""Quantum password generation engine with unbiased rejection sampling and strict uniform category enforcement."""

import math
import time
from typing import Dict, Any, List, Optional
from password_engine.character_mapping import CharacterMap
from password_engine.entropy import EntropyEngine
from quantum_engine.random_bits import quantum_bit_generator


class QuantumPasswordGenerator:
    """
    Produces cryptographically sound passwords from simulated quantum superposition
    measurement streams using strictly unbiased rejection sampling.

    Guarantees:
    1. Bit-level Unbiased Rejection Sampling:
       For character pool N, chunk size k = ceil(log2(N)).
       Candidates >= N are rejected rather than modulo-reduced, eliminating modulo bias.
    2. Password-level Category Constraint Rejection Sampling:
       Complete candidate passwords of length L that do not contain at least one character
       from every selected category are rejected in their entirety and resampled.
       This preserves the exact uniform distribution over the valid constrained password space M,
       avoiding the non-uniform positional bias caused by in-place replacement.
    """

    @classmethod
    def generate_passwords(
        cls,
        length: int = 16,
        uppercase: bool = True,
        lowercase: bool = True,
        numbers: bool = True,
        symbols: bool = True,
        count: int = 1,
    ) -> Dict[str, Any]:
        """
        Generates 'count' passwords of given length using quantum AerSimulator bitstreams.
        """
        # 1. Validation
        if not (8 <= length <= 64):
            raise ValueError(f"Password length ({length}) must be between 8 and 64 characters.")
        if not (1 <= count <= 10):
            raise ValueError(f"Password count ({count}) must be between 1 and 10.")
        if not any([uppercase, lowercase, numbers, symbols]):
            raise ValueError("At least one character category must be selected.")

        start_time = time.perf_counter()

        # 2. Build character set and category mapping
        char_pool, categories = CharacterMap.build_character_pool(
            include_upper=uppercase,
            include_lower=lowercase,
            include_numbers=numbers,
            include_symbols=symbols,
        )
        n = len(char_pool)
        category_sizes = [len(c_str) for c_str in categories.values()]

        # 3. Calculate bit chunk size k = ceil(log2(N))
        k = math.ceil(math.log2(n)) if n > 1 else 1

        passwords_list = []
        all_traces = []
        total_quantum_bits_consumed = 0
        total_candidates_rejected_modulo = 0
        total_candidates_accepted_modulo = 0
        total_passwords_rejected_constraint = 0

        # Bit stream buffer
        bit_buffer = ""

        def ensure_bits(needed: int):
            nonlocal bit_buffer, total_quantum_bits_consumed
            if len(bit_buffer) < needed:
                fetch_amount = max(needed * 2, 256)
                result = quantum_bit_generator.generate_quantum_bits(fetch_amount)
                bit_buffer += result["bits"]
                total_quantum_bits_consumed += result["total_bits_generated"]

        def get_k_bits(num_bits: int) -> str:
            nonlocal bit_buffer
            ensure_bits(num_bits)
            extracted = bit_buffer[:num_bits]
            bit_buffer = bit_buffer[num_bits:]
            return extracted

        # Generate each requested password
        for p_idx in range(count):
            accepted_password = None
            sample_trace_steps = []

            # Password-level rejection loop to enforce category constraints uniformly
            while accepted_password is None:
                candidate_chars = []
                current_candidate_trace = []

                # Draw L characters via unbiased bit-level rejection sampling
                while len(candidate_chars) < length:
                    chunk = get_k_bits(k)
                    candidate_int = int(chunk, 2)

                    # Unbiased Rejection Sampling:
                    # Accept candidate if candidate_int < N.
                    # If candidate_int >= N, reject to prevent modulo bias!
                    if candidate_int < n:
                        chosen_char = char_pool[candidate_int]
                        candidate_chars.append(chosen_char)
                        total_candidates_accepted_modulo += 1
                        current_candidate_trace.append({
                            "step": len(candidate_chars),
                            "bits": chunk,
                            "integer": candidate_int,
                            "accepted": True,
                            "character": chosen_char,
                            "category": CharacterMap.get_category_of_char(chosen_char),
                            "reason": f"Value {candidate_int} < pool size {n} (Accepted)",
                        })
                    else:
                        total_candidates_rejected_modulo += 1
                        current_candidate_trace.append({
                            "step": len(candidate_chars) + 1,
                            "bits": chunk,
                            "integer": candidate_int,
                            "accepted": False,
                            "character": None,
                            "category": None,
                            "reason": f"Value {candidate_int} >= pool size {n} (Rejected to prevent modulo bias)",
                        })

                # Check category constraints:
                # Password must contain at least one character from each selected category
                satisfies_all_categories = True
                missing_cats = []
                for cat_name, cat_chars in categories.items():
                    if not any(c in cat_chars for c in candidate_chars):
                        satisfies_all_categories = False
                        missing_cats.append(cat_name)

                if satisfies_all_categories:
                    # Candidate satisfies all category constraints: ACCEPT!
                    accepted_password = "".join(candidate_chars)
                    if not sample_trace_steps:
                        sample_trace_steps = current_candidate_trace
                else:
                    # Candidate violates category constraints: REJECT entire candidate!
                    total_passwords_rejected_constraint += 1
                    # Resample without modifying characters in place

            passwords_list.append(accepted_password)
            all_traces.append(sample_trace_steps)

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # 4. Rigorous Entropy & Search Space Calculations
        # Distinguish between constrained uniform keyspace M and unconstrained N^L
        exact_keyspace = EntropyEngine.format_search_space(
            length=length,
            character_set_size=n,
            category_sizes=category_sizes,
        )

        constrained_entropy = EntropyEngine.calculate_constrained_entropy(length, category_sizes)
        unconstrained_entropy = EntropyEngine.calculate_theoretical_entropy(length, n)

        # If only 1 category selected, constrained equals unconstrained
        effective_entropy = constrained_entropy if len(category_sizes) > 1 else unconstrained_entropy

        strength_eval = EntropyEngine.classify_strength(effective_entropy)
        crack_times = EntropyEngine.estimate_crack_times(effective_entropy)

        # Sampling statistics
        total_chunks = total_candidates_accepted_modulo + total_candidates_rejected_modulo
        rejection_rate = round(
            (total_candidates_rejected_modulo / max(1, total_chunks)) * 100, 2
        )

        primary_password = passwords_list[0] if passwords_list else ""

        return {
            "primary_password": primary_password,
            "passwords": passwords_list,
            "length": length,
            "character_set_size": n,
            "categories_enforced": list(categories.keys()),
            "theoretical_entropy_bits": effective_entropy,
            "unconstrained_entropy_bits": unconstrained_entropy,
            "entropy_formula": (
                "H = log2(M) for uniform category-constrained passwords, where M is exact valid space via Inclusion-Exclusion."
                if len(category_sizes) > 1
                else "H = L * log2(N) for unconstrained password space."
            ),
            "search_space": exact_keyspace,
            "strength": strength_eval,
            "crack_time_estimates": crack_times,
            "sampling_metrics": {
                "bit_chunk_size_k": k,
                "character_pool_size_n": n,
                "candidates_accepted": total_candidates_accepted_modulo,
                "candidates_rejected": total_candidates_rejected_modulo,
                "rejection_rate_pct": rejection_rate,
                "password_candidates_rejected_constraint": total_passwords_rejected_constraint,
                "quantum_bits_consumed": total_quantum_bits_consumed,
                "rejection_sampling_method": "Strict rejection of candidates >= N (zero modulo bias) & complete candidate rejection on constraint miss (uniform distribution)",
            },
            "trace_data": {
                "sample_trace": all_traces[0][:24] if all_traces else [],
                "bits_used": total_quantum_bits_consumed,
            },
            "execution_time_ms": duration_ms,
            "generation_source": "Qiskit AerSimulator (Hadamard Superposition)",
        }
