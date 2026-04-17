import {
    FaFilePdf,
    FaFileImage,
    FaFileWord,
    FaFileExcel,
    FaFilePowerpoint,
    FaFileArchive,
    FaFileCode,
    FaFileVideo,
    FaFileAudio,
    FaFileAlt,
} from "react-icons/fa";

export const getFileIcon = (filename) => {
    if (!filename) return <FaFileAlt size={36} />;
    const ext = filename.split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return <FaFilePdf size={36} color="#ef4444" />;
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext))
        return <FaFileImage size={36} color="#3b82f6" />;
    if (["doc", "docx"].includes(ext))
        return <FaFileWord size={36} color="#2563eb" />;
    if (["xls", "xlsx", "csv"].includes(ext))
        return <FaFileExcel size={36} color="#16a34a" />;
    if (["ppt", "pptx"].includes(ext))
        return <FaFilePowerpoint size={36} color="#d97706" />;
    if (["zip", "rar", "7z", "tar"].includes(ext))
        return <FaFileArchive size={36} color="#9333ea" />;
    if (["mp4", "mkv", "avi", "mov"].includes(ext))
        return <FaFileVideo size={36} color="#be123c" />;
    if (["mp3", "wav", "ogg"].includes(ext))
        return <FaFileAudio size={36} color="#db2777" />;
    if (
        [
            "js",
            "jsx",
            "ts",
            "tsx",
            "html",
            "css",
            "json",
            "py",
            "java",
            "c",
            "cpp",
        ].includes(ext)
    )
        return <FaFileCode size={36} color="#4b5563" />;
    return <FaFileAlt size={36} color="#64748b" />;
};