import React, { useState } from "react";

import { BankRecord } from "../models";

const CSVUploader = ({ onUpload }: { onUpload: (records: BankRecord[]) => void }) => {
    const handleFileUpload = (event:any) => {
        const file = event.target.files[0];

        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split("\n").slice(1); // Assuming first line is header
            const records = lines.map((line:any, index:any) => {
                const [date, amount, description] = line.split(","); // Adjust based on CSV format
                return {
                    id: index + 1,
                    date: date.trim(),
                    amount: parseFloat(amount),
                    description: description.trim(),
                };
            });

            onUpload(records); // Pass new bank records to parent
        };

        reader.readAsText(file);
    };

    return <input type="file" accept=".csv" onChange={handleFileUpload} />;
};


export default CSVUploader;
