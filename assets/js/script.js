// Initialize pdf-lib
const { PDFDocument, StandardFonts, rgb } = PDFLib;

let currentTemplateType = '';

// Load Config from global variable (loaded via config.js)
window.onload = function () {
    if (typeof APP_CONFIG !== 'undefined') {
        if (document.getElementById('contactnumber')) document.getElementById('contactnumber').value = APP_CONFIG.defaultContactNumber || '';
        if (document.getElementById('doctorname')) document.getElementById('doctorname').value = APP_CONFIG.defaultDoctorName || '';
        if (document.getElementById('referringhospital')) document.getElementById('referringhospital').value = APP_CONFIG.defaultReferringHospital || '';
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
};

function selectTemplate(type) {
    currentTemplateType = type;
    document.getElementById('selection-screen').classList.remove('active');

    // Toggle Doctor Name field based on type
    const doctorGroup = document.getElementById('doctor-group');
    if (type === 'initial') {
        doctorGroup.style.display = 'none';
        // Clear value if hidden to avoid sending it? Or keep default? 
        // User said "it's not in it" (the PDF), so filling it shouldn't hurt if field doesn't exist, 
        // but UI-wise it should be hidden.
    } else {
        doctorGroup.style.display = 'block';
        // Restore default if cleared or empty
        if (!document.getElementById('doctorname').value) {
            document.getElementById('doctorname').value = config.defaultDoctorName || '';
        }
    }

    setTimeout(() => {
        document.getElementById('form-screen').classList.add('active');
        const titleText = type === 'initial' ? 'Initial Report (مبدئي)' : 'Final Report (نهائي)';
        document.getElementById('form-title').innerText = titleText;
    }, 300);
}

function goBack() {
    document.getElementById('form-screen').classList.remove('active');
    setTimeout(() => {
        document.getElementById('selection-screen').classList.add('active');
        document.getElementById('data-form').reset();
    }, 300);
}

document.getElementById('data-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // logic to bypass validation for hidden fields
    const doctorInput = document.getElementById('doctorname');
    if (currentTemplateType === 'initial') {
        doctorInput.removeAttribute('required');
    } else {
        doctorInput.setAttribute('required', '');
    }

    generatePDF();
});

async function generatePDF() {
    try {
        if (typeof PDF_TEMPLATES === 'undefined') {
            alert("Error: Template data file (templates.js) is missing or not loaded. Please ensure the file exists in the same directory.");
            return;
        }

        const templateBase64 = PDF_TEMPLATES[currentTemplateType];
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
            contactnumber: document.getElementById('contactnumber').value,
            referraldate: formattedDate,
            referringhospital: document.getElementById('referringhospital').value
        };

        // Map HTML inputs to PDF Form Fields
        // User specified field names: 
        // contactnumber, doctorname, referraldate, referringhospital, patientid, patientname

        try {
            let fields = [
                'patientname',
                'patientid',
                'contactnumber',
                'referraldate',
                'referringhospital'
            ];

            // doctorname is only present in the Final report
            if (currentTemplateType !== 'initial') {
                fields.push('doctorname');
            }

            // Embed font for supporting text
            // Note: Standard fonts (Helvetica) usually don't support Arabic. 
            // If Arabic input is needed, we need a custom font. 
            // For now assuming English/Numeric input or standard font sufficiency.
            // Form fields often have their own fonts defined, but we can override if needed.
            // const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            fields.forEach(fieldName => {
                const field = form.getTextField(fieldName);
                if (field) {
                    field.setText(inputs[fieldName]);
                    // Optional: Make read-only
                    // field.enableReadOnly(); 
                } else {
                    console.warn(`Field ${fieldName} not found in PDF form.`);
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
        const reportType = currentTemplateType === 'initial' ? 'INITIAL' : 'FINAL';
        const filename = `GAMA_${reportType}_MEDICAL_ACCEPTANCE_${inputs.patientname.replace(/\s+/g, '_')}.pdf`;
        download(pdfBytes, filename, "application/pdf");

    } catch (err) {
        console.error("Error generating PDF:", err);
        alert("An error occurred while generating the PDF. Check console for details.");
    }
}
