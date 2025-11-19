"use client";

import { X, FileText, FileArchive, FileImage, File } from "lucide-react";

export default function FileCard({
    file,
    onDelete,
}: {
    file: File;
    onDelete: () => void;
}) {
    const getIcon = () => {
        if (file.type.includes("pdf")) return <FileText className="w-6 h-6 text-green-700" />;
        if (file.type.includes("zip") || file.type.includes("rar"))
            return <FileArchive className="w-6 h-6 text-green-700" />;
        if (file.type.includes("image"))
            return <FileImage className="w-6 h-6 text-green-700" />;
        return <File className="w-6 h-6 text-green-700" />;
    };

    return (
        <div className="relative w-48 p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition flex-shrink-0">

            {/* Delete button pojok kanan atas */}
            <button
                onClick={onDelete}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Icon di tengah */}
            <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    {getIcon()}
                </div>
            </div>

            {/* File info */}
            <div className="text-center">
                <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
        </div>
    );
}
