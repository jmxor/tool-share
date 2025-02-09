"use client";

import { useState, useCallback } from "react";

interface StarRatingProps {
    name: string;
    onChange: (value: number) => void;
    value?: number;
}

export default function StarsPage({ name, onChange, value = 0 }: StarRatingProps) {
    const [rating, setRating] = useState(value);

    const handleClick = useCallback(
        (value: number) => {
            setRating(value);
            onChange(value);
        },
        [onChange]
    );

    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((value) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => handleClick(value)}
                    className={`text-3xl ${value <= rating ? "text-yellow-500" : "text-gray-300"
                        } hover:text-yellow-400 transition-colors`}
                    aria-label={`${value} stars`}
                >
                    ★
                </button>
            ))}
            <input
                type="hidden"
                name={name}
                value={rating}
                readOnly
            />
        </div>
    );
}
