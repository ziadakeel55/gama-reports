// Initialize pdf-lib
const { PDFDocument, StandardFonts, rgb } = PDFLib;

// Load Config from global variable (loaded via config.js)
// Load Config from global variable (loaded via config.js)
let selectedReportType = 'initial'; // Default

window.onload = function () {
    if (typeof APP_CONFIG !== 'undefined') {
        if (document.getElementById('contactnumber')) document.getElementById('contactnumber').value = APP_CONFIG.defaultContactNumber || '';
    } else {
        console.error("APP_CONFIG is not defined. Ensure config.js is loaded.");
    }

    // Set default date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    if (document.getElementById('referraldate')) {
        document.getElementById('referraldate').value = formattedDate;
    }

    // Add Form Submit Listener for V1
    const form = document.getElementById('data-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            handleDownload(selectedReportType);
        });
    }
};

function selectTemplate(type) {
    selectedReportType = type;
    document.getElementById('selection-screen').classList.remove('active');
    document.getElementById('form-screen').classList.add('active');
}

function goBack() {
    document.getElementById('form-screen').classList.remove('active');
    document.getElementById('selection-screen').classList.add('active');
}

function handleDownload(type) {
    const doctorInput = document.getElementById('doctorname');
    const form = document.getElementById('data-form');

    // Validation
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    if (type === 'final') {
        if (!doctorInput.value.trim()) {
            showWarning();
            return;
        }
    } else {
        // for initial, we don't care about doctor name
    }

    generatePDF(type);
}

function showWarning() {
    document.getElementById('warning-modal').style.display = 'block';
}

function closeWarning() {
    document.getElementById('warning-modal').style.display = 'none';
    document.getElementById('doctorname').focus();
}

async function generatePDF(type) {
    try {
        if (typeof PDF_TEMPLATES === 'undefined') {
            alert("Error: Template data file (templates.js) is missing or not loaded. Please ensure the file exists in the same directory.");
            return;
        }

        const templateBase64 = PDF_TEMPLATES[type];
        if (!templateBase64) {
            alert("Template not found!");
            return;
        }

        const pdfDoc = await PDFDocument.load(templateBase64);

        // Get the form containing the fields
        const form = pdfDoc.getForm();

        // Get Data from HTML inputs
        const rawDate = document.getElementById('referraldate').value;
        let formattedDate = rawDate;
        if (rawDate) {
            const [yyyy, mm, dd] = rawDate.split('-');
            formattedDate = `${dd}-${mm}-${yyyy}`;
        }

        const inputs = {
            patientname: document.getElementById('patientname').value,
            patientid: document.getElementById('patientid').value,
            doctorname: document.getElementById('doctorname').value,
            contactnumber: document.getElementById('consultantname')
                ? `${document.getElementById('consultantname').value} | ${document.getElementById('contactnumber').value}`
                : document.getElementById('contactnumber').value,
            referraldate: formattedDate,
            referringhospital: document.getElementById('referringhospital').value,
            company: document.getElementById('company') ? document.getElementById('company').value : 'Insurance company'
        };

        try {
            let fields = [
                'patientname',
                'patientid',
                'contactnumber',
                'referraldate',
                'referringhospital'
            ];

            // doctorname and company are only present in the Final report
            if (type === 'final') {
                fields.push('doctorname');
                fields.push('company');
            }

            fields.forEach(fieldName => {
                try {
                    // Try to get exactly as named
                    const field = form.getTextField(fieldName);
                    if (field) {
                        field.setText(inputs[fieldName]);
                    }
                } catch (e) {
                    console.warn(`Field ${fieldName} not found in PDF form. Trying case-insensitive search...`);
                    // Fallback: Case-insensitive search
                    try {
                        const allFields = form.getFields();
                        const matchingField = allFields.find(f => f.getName().toLowerCase().trim() === fieldName.toLowerCase().trim());
                        if (matchingField) {
                            form.getTextField(matchingField.getName()).setText(inputs[fieldName]);
                        } else {
                            alert(`لم يتم العثور على حقل بالاسم "${fieldName}" في ملف الـ PDF الحالي. \nيرجى التأكد من تحويل ملف الـ PDF الجديد (الذي يحتوي على الحقل) إلى Base64 وتحديث ملف templates.js.`);
                        }
                    } catch (fallbackError) {
                        console.error(`Fallback failed for field ${fieldName}:`, fallbackError);
                    }
                }
            });

            // Flatten to make the fields part of the page content (un-editable)
            form.flatten();

        } catch (e) {
            console.error("Error filling form fields:", e);
            alert("Error filling PDF fields. Please ensure the PDF template has the correct field names.");
            return;
        }

        const pdfBytes = await pdfDoc.save();

        // Download
        const reportType = type === 'initial' ? 'INITIAL' : 'FINAL';
        const filename = `GAMA_${reportType}_MEDICAL_ACCEPTANCE_${inputs.patientname.replace(/\s+/g, '_')}.pdf`;
        download(pdfBytes, filename, "application/pdf");

    } catch (err) {
        console.error("Error generating PDF:", err);
        alert("An error occurred while generating the PDF. Check console for details.");
    }
}
