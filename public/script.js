document.getElementById("translateBtn").addEventListener("click", async () => {
    const apiKey = document.getElementById('apiKey').value;
    const fileInput = document.getElementById("srtFile");
    const status = document.getElementById("status");
    const downloadLink = document.getElementById("downloadLink");
    const previewArea = document.getElementById("previewArea"); // Thêm phần này để hiển thị preview

    if (!apiKey) {
        alert('Vui lòng nhập Gemini API Key');
        return;
    }
    
    if (!fileInput.files.length) {
        status.textContent = "Vui lòng chọn file SRT.";
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

//     reader.onload = async function () {
//         const srtContent = reader.result;
//         status.textContent = "Đang xử lý file...";

//         // Tách nội dung thành các phần nhỏ
//         const CHARACTER_PER_BATCH = 1000; // Kích thước đoạn nhỏ
//         const parts = splitSRTContent(srtContent, CHARACTER_PER_BATCH);

//         // Dịch từng đoạn
//         const translatedParts = [];
//         previewArea.innerHTML = ""; // Xóa nội dung preview cũ trước khi dịch

//         for (let i = 0; i < parts.length; i++) {
//             status.textContent = `Đang dịch đoạn ${i + 1}/${parts.length}...`;

//             try {
//                 const response = await fetch("/api/translate", {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ inputContent: parts[i] }),
//                 });

//                 if (!response.ok) throw new Error(`Lỗi khi dịch đoạn ${i + 1}`);
//                 const data = await response.json();
//                 const translatedPart = data.translatedContent;

//                 // Lưu đoạn dịch và hiển thị preview
//                 translatedParts.push(translatedPart);
//                 const previewElement = document.createElement("p");
//                 previewElement.innerHTML = translatedPart.replace(/\n/g, "<br>");
//                 previewArea.appendChild(previewElement);
//             } catch (error) {
//                 console.error(error);
//                 translatedParts.push(`// Lỗi khi dịch đoạn ${i + 1}`);
//                 const errorElement = document.createElement("p");
//                 errorElement.textContent = `Lỗi khi dịch đoạn ${i + 1}`;
//                 errorElement.style.color = "red";
//                 previewArea.appendChild(errorElement);
//             }
//         }

//         // Tạo file đã dịch sau khi hoàn thành
//         const translatedContent = translatedParts.join("\n");
//         const blob = new Blob([translatedContent], { type: "text/plain" });
//         const url = URL.createObjectURL(blob);

//         // Hiển thị link tải file
//         downloadLink.href = url;
//         downloadLink.download = "translated.srt";
//         downloadLink.textContent = "Tải file đã dịch";
//         downloadLink.style.display = "block";

//         status.textContent = "Dịch thành công!";
//     };

//     reader.readAsText(file);
// });

    reader.onload = async function () {
        const srtContent = reader.result;
        status.textContent = "Đang xử lý file...";

        // Tách nội dung thành các phần nhỏ
        const CHARACTER_PER_BATCH = 1000; // Kích thước đoạn nhỏ
        const parts = splitSRTContent(srtContent, CHARACTER_PER_BATCH);

        // Dịch từng đoạn
        const translatedParts = [];
        previewArea.innerHTML = ""; // Xóa nội dung preview cũ trước khi dịch

        for (let i = 0; i < parts.length; i++) {
            status.textContent = `Đang dịch đoạn ${i + 1}/${parts.length}...`;

            const maxRetries = 3;
            let attempts = 0;
            let success = false;

            while (attempts < maxRetries && !success) {
                try {
                    const response = await fetch("/api/translate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ inputContent: parts[i], apiKey: apiKey }),
                    });

                    if (!response.ok) throw new Error(`Lỗi khi dịch đoạn ${i + 1}`);
                    const data = await response.json();
                    const translatedPart = data.translatedContent;

                    // Lưu đoạn dịch và hiển thị preview
                    translatedParts.push(translatedPart);
                    const previewElement = document.createElement("p");
                    previewElement.innerHTML = translatedPart.replace(/\n/g, "<br>");
                    previewArea.appendChild(previewElement);

                    // Auto scroll to the bottom
                    previewArea.scrollTop = previewArea.scrollHeight;
                    success = true;
                } catch (error) {
                    attempts++;
                    console.error(`Attempt ${attempts} failed:`, error);

                    if (attempts >= maxRetries) {
                        translatedParts.push(`// Lỗi khi dịch đoạn ${i + 1}`);
                        const errorElement = document.createElement("p");
                        errorElement.textContent = `Lỗi khi dịch đoạn ${i + 1}`;
                        errorElement.style.color = "red";
                        previewArea.appendChild(errorElement);
                    }
                }
            }
        }

        // Tạo file đã dịch sau khi hoàn thành
        const translatedContent = translatedParts.join("\n");
        const blob = new Blob([translatedContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        // Hiển thị link tải file
        downloadLink.href = url;
        downloadLink.download = "translated.srt";
        downloadLink.textContent = "Tải file đã dịch";
        downloadLink.style.display = "block";

        status.textContent = "Dịch thành công!";
    };
    reader.readAsText(file);
});

// Hàm tách nội dung SRT
function splitSRTContent(srtContent, charLimit) {
    const lines = srtContent.split('\n');
    const parts = [];
    let currentPart = '';

    for (const line of lines) {
        if ((currentPart.length + line.length + 1 > charLimit) && line.trim() === '') {
            parts.push(currentPart.trim());
            currentPart = '';
        }
        currentPart += line + '\n';
    }
    if (currentPart) parts.push(currentPart.trim());
    return parts;
}
