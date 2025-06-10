"use strict";

class PersonalInfo {
    constructor(name, email, phone, address, summary) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.summary = summary;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        if (typeof value !== 'string' || value.trim() === '') {
            throw new Error('Ім\'я повинно бути не порожнім рядком');
        }
        this._name = value.trim();
    }

    get email() {
        return this._email;
    }

    set email(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            throw new Error('Введіть коректний email');
        }
        this._email = value.trim();
    }

    display() {
            return `
            <div class="section">
                <h2>${this.name}</h2>
                <p>Email: ${this.email}</p>
                ${this.phone ? `<p>Телефон: ${this.phone}</p>` : ''}
                ${this.address ? `<p>Адреса: ${this.address}</p>` : ''}
                ${this.summary ? `<h3>Про себе</h3><p>${this.summary}</p>` : ''}
            </div>
        `;
    }
}

class Experience {
    constructor(position, company, startDate, endDate, description) {
        this.position = position;
        this.company = company;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
    }

    display() {
        return `
            <div class="experience-item">
                <h3>${this.position} - ${this.company}</h3>
                <p>${this.startDate} - ${this.endDate || 'до тепер'}</p>
                ${this.description ? `<p>${this.description}</p>` : ''}
            </div>
        `;
    }
}

class Education {
    constructor(institution, degree, graduationYear, description) {
        this.institution = institution;
        this.degree = degree;
        this.graduationYear = graduationYear;
        this.description = description;
    }

    display() {
        return `
            <div class="education-item">
                <h3>${this.institution}</h3>
                <p>${this.degree}, ${this.graduationYear}</p>
                ${this.description ? `<p>${this.description}</p>` : ''}
            </div>
        `;
    }
}

class Skills {
    constructor() {
        this.skills = [];
    }

    addSkill(skill) {
        if (skill && typeof skill === 'string' && skill.trim() !== '') {
            this.skills.push(skill.trim());
        }
    }

    display() {
        if (this.skills.length === 0) return '';
        
        const skillsHTML = this.skills.map(skill => 
            `<span class="skill-tag">${skill} <i class="fas fa-times remove-skill"></i></span>`
        ).join('');
        
        return `
            <div class="section">
                <h3>Навички</h3>
                <div class="skills-list">${skillsHTML}</div>
            </div>
        `;
    }
}

class Resume {
    constructor() {
        this.personalInfo = null;
        this.experiences = [];
        this.educations = [];
        this.skills = new Skills();
    }

    setPersonalInfo(info) {
        this.personalInfo = info;
    }

    addExperience(experience) {
        this.experiences.push(experience);
    }

    addEducation(education) {
        this.educations.push(education);
    }

    display() {
        if (!this.personalInfo) {
            return '<p>Будь ласка, введіть особисту інформацію</p>';
        }

        let html = this.personalInfo.display();
        
        if (this.experiences.length > 0) {
            html += '<div class="section"><h3>Досвід роботи</h3>';
            this.experiences.forEach(exp => {
                html += exp.display();
            });
            html += '</div>';
        }
        
        if (this.educations.length > 0) {
            html += '<div class="section"><h3>Освіта</h3>';
            this.educations.forEach(edu => {
                html += edu.display();
            });
            html += '</div>';
        }
        
        html += this.skills.display();
        
        return html;
    }
}

class UIHelper {
    static showLoading(button) {
        button.classList.add('loading');
        button.innerHTML = '<i class="fas fa-spinner"></i> Обробка...';
    }

    static hideLoading(button, originalText) {
        button.classList.remove('loading');
        button.innerHTML = originalText;
    }

    static showError(input, message) {
        const errorElement = document.getElementById(`${input.id}-error`);
        input.style.borderColor = 'var(--error-color)';
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    static hideError(input) {
        const errorElement = document.getElementById(`${input.id}-error`);
        input.style.borderColor = '';
        errorElement.style.display = 'none';
    }

    static makeDraggable(element, onDrop) {
        element.draggable = true;
        
        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', element.id);
            setTimeout(() => element.classList.add('dragging'), 0);
        });

        element.addEventListener('dragend', () => {
            element.classList.remove('dragging');
        });

        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingElement = document.querySelector('.dragging');
            if (draggingElement && element !== draggingElement) {
                const rect = element.getBoundingClientRect();
                const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                document.querySelector(`#${element.parentElement.id}`).insertBefore(
                    draggingElement, 
                    next ? element.nextSibling : element
                );
            }
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            if (onDrop) onDrop();
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    let resume = new Resume();
    let editMode = false;
    let originalButtonText = '';

    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.body.dataset.theme || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.dataset.theme = newTheme;
        themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('resumeTheme', newTheme);
    });

    if (localStorage.getItem('resumeTheme') === 'dark') {
        document.body.dataset.theme = 'dark';
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    function validateForm() {
        let isValid = true;
        
        const nameInput = document.getElementById('name');
        if (!nameInput.value.trim()) {
            UIHelper.showError(nameInput, 'Будь ласка, введіть ваше ім\'я');
            isValid = false;
        } else {
            UIHelper.hideError(nameInput);
        }
        
        const emailInput = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            UIHelper.showError(emailInput, 'Будь ласка, введіть коректний email');
            isValid = false;
        } else {
            UIHelper.hideError(emailInput);
        }
        
        return isValid;
    }

    function addExperienceField(data = {}) {
        const container = document.getElementById('experience-container');
        const id = `exp-${Date.now()}`;
        const div = document.createElement('div');
        div.className = 'experience-item';
        div.id = id;
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                <button type="button" class="remove-btn btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i> Видалити
                </button>
            </div>
            <label>Посада:</label>
            <input type="text" class="exp-position" value="${data.position || ''}" required>
            
            <label>Компанія:</label>
            <input type="text" class="exp-company" value="${data.company || ''}" required>
            
            <label>Початок роботи:</label>
            <input type="text" class="exp-start" placeholder="РРРР-ММ" value="${data.startDate || ''}">
            
            <label>Закінчення роботи:</label>
            <input type="text" class="exp-end" placeholder="РРРР-ММ (або залиште порожнім, якщо до тепер)" value="${data.endDate || ''}">
            
            <label>Опис:</label>
            <textarea class="exp-desc" rows="3">${data.description || ''}</textarea>
        `;
        container.appendChild(div);
        
        div.querySelector('.remove-btn').addEventListener('click', function() {
            container.removeChild(div);
        });
        
        UIHelper.makeDraggable(div, updateResumeOrder);
    }

    function addEducationField(data = {}) {
        const container = document.getElementById('education-container');
        const id = `edu-${Date.now()}`;
        const div = document.createElement('div');
        div.className = 'education-item';
        div.id = id;
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                <button type="button" class="remove-btn btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i> Видалити
                </button>
            </div>
            <label>Навчальний заклад:</label>
            <input type="text" class="edu-institution" value="${data.institution || ''}" required>
            
            <label>Ступінь/спеціальність:</label>
            <input type="text" class="edu-degree" value="${data.degree || ''}" required>
            
            <label>Рік закінчення:</label>
            <input type="text" class="edu-year" placeholder="РРРР" value="${data.graduationYear || ''}">
            
            <label>Опис:</label>
            <textarea class="edu-desc" rows="3">${data.description || ''}</textarea>
        `;
        container.appendChild(div);
        
        div.querySelector('.remove-btn').addEventListener('click', function() {
            container.removeChild(div);
        });
        
        UIHelper.makeDraggable(div, updateResumeOrder);
    }

    function addSkillField(value = '') {
        const container = document.getElementById('skills-container');
        const div = document.createElement('div');
        div.className = 'skill-item';
        div.innerHTML = `
            <div style="display: flex; gap: 0.5rem;">
                <input type="text" class="skill-input" value="${value}" placeholder="Наприклад: JavaScript, HTML, CSS" style="flex-grow: 1;">
                <button type="button" class="remove-btn btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(div);
        
        div.querySelector('.remove-btn').addEventListener('click', function() {
            container.removeChild(div);
        });
    }

    function updateResumeOrder() {
        if (!editMode) generateResume();
    }

    function generateResume() {
        if (!validateForm()) return false;
        
        const generateBtn = document.getElementById('generate-resume');
        originalButtonText = generateBtn.innerHTML;
        UIHelper.showLoading(generateBtn);
        
        setTimeout(() => {
            try {
                resume = new Resume();
                
                const personalInfo = new PersonalInfo(
                    document.getElementById('name').value,
                    document.getElementById('email').value,
                    document.getElementById('phone').value,
                    document.getElementById('address').value,
                    document.getElementById('summary').value
                );
                resume.setPersonalInfo(personalInfo);
                
                document.querySelectorAll('.experience-item').forEach(item => {
                    const experience = new Experience(
                        item.querySelector('.exp-position').value,
                        item.querySelector('.exp-company').value,
                        item.querySelector('.exp-start').value,
                        item.querySelector('.exp-end').value,
                        item.querySelector('.exp-desc').value
                    );
                    resume.addExperience(experience);
                });
                
                document.querySelectorAll('.education-item').forEach(item => {
                    const education = new Education(
                        item.querySelector('.edu-institution').value,
                        item.querySelector('.edu-degree').value,
                        item.querySelector('.edu-year').value,
                        item.querySelector('.edu-desc').value
                    );
                    resume.addEducation(education);
                });
                
                document.querySelectorAll('.skill-input').forEach(skill => {
                    if (skill.value.trim() !== '') {
                        resume.skills.addSkill(skill.value);
                    }
                });
                
                document.getElementById('resume-output').innerHTML = resume.display();
                
                document.querySelectorAll('.remove-skill').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const skillTag = this.parentElement;
                        skillTag.remove();
                        saveToLocalStorage();
                    });
                });
                
                saveToLocalStorage();
                editMode = false;
                
                UIHelper.hideLoading(generateBtn, originalButtonText);
                return true;
            } catch (error) {
                alert(`Помилка: ${error.message}`);
                UIHelper.hideLoading(generateBtn, originalButtonText);
                return false;
            }
        }, 1000);
    }

    function getFormData() {
        return {
            personalInfo: {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                summary: document.getElementById('summary').value
            },
            experiences: Array.from(document.querySelectorAll('.experience-item')).map(item => ({
                position: item.querySelector('.exp-position').value,
                company: item.querySelector('.exp-company').value,
                startDate: item.querySelector('.exp-start').value,
                endDate: item.querySelector('.exp-end').value,
                description: item.querySelector('.exp-desc').value
            })),
            educations: Array.from(document.querySelectorAll('.education-item')).map(item => ({
                institution: item.querySelector('.edu-institution').value,
                degree: item.querySelector('.edu-degree').value,
                graduationYear: item.querySelector('.edu-year').value,
                description: item.querySelector('.edu-desc').value
            })),
            skills: Array.from(document.querySelectorAll('.skill-input')).map(skill => skill.value)
        };
    }

    function fillFormWithData(data) {
        if (data.personalInfo) {
            document.getElementById('name').value = data.personalInfo.name || '';
            document.getElementById('email').value = data.personalInfo.email || '';
            document.getElementById('phone').value = data.personalInfo.phone || '';
            document.getElementById('address').value = data.personalInfo.address || '';
            document.getElementById('summary').value = data.personalInfo.summary || '';
        }

        const expContainer = document.getElementById('experience-container');
        expContainer.innerHTML = '';
        if (data.experiences && data.experiences.length > 0) {
            data.experiences.forEach(exp => {
                addExperienceField(exp);
            });
        }

        const eduContainer = document.getElementById('education-container');
        eduContainer.innerHTML = '';
        if (data.educations && data.educations.length > 0) {
            data.educations.forEach(edu => {
                addEducationField(edu);
            });
        }

        const skillsContainer = document.getElementById('skills-container');
        skillsContainer.innerHTML = '';
        if (data.skills && data.skills.length > 0) {
            data.skills.forEach(skill => {
                addSkillField(skill);
            });
        }
    }

    function getFormDataFromResume() {
        const resumeOutput = document.getElementById('resume-output');
        if (!resumeOutput || resumeOutput.querySelector('.resume-preview')) {
            alert('Спочатку створіть резюме');
            return null;
        }
        
        const savedData = localStorage.getItem('resumeData');
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (e) {
                console.error('Помилка завантаження даних:', e);
                return null;
            }
        }
        return null;
    }

    function saveToLocalStorage() {
        const formData = getFormData();
        localStorage.setItem('resumeData', JSON.stringify(formData));
    }

    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('resumeData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                fillFormWithData(data);
            } catch (e) {
                console.error('Помилка завантаження даних:', e);
            }
        }
    }

    document.getElementById('add-experience').addEventListener('click', function() {
        addExperienceField();
    });

    document.getElementById('add-education').addEventListener('click', function() {
        addEducationField();
    });

    document.getElementById('add-skill').addEventListener('click', function() {
        addSkillField();
    });

    document.getElementById('generate-resume').addEventListener('click', generateResume);

    document.getElementById('clear-resume').addEventListener('click', function() {
        if (confirm('Ви впевнені, що хочете очистити всі дані?')) {
            document.querySelectorAll('input, textarea').forEach(el => {
                if (el.type !== 'button') {
                    el.value = '';
                }
            });
            document.getElementById('experience-container').innerHTML = '';
            document.getElementById('education-container').innerHTML = '';
            document.getElementById('skills-container').innerHTML = '';
            document.getElementById('resume-output').innerHTML = `
                <div class="resume-preview">
                    <div>
                        <i class="fas fa-file-alt fa-3x" style="margin-bottom: 1rem;"></i>
                        <p>Тут буде відображатися ваше резюме<br>Після заповнення форми натисніть "Створити резюме"</p>
                    </div>
                </div>
            `;
            localStorage.removeItem('resumeData');
        }
    });

    document.getElementById('load-example').addEventListener('click', function() {
        if (confirm('Завантажити приклад резюме? Поточні дані буде втрачено.')) {
            const exampleData = {
                personalInfo: {
                    name: 'Іванов Іван Іванович',
                    email: 'ivanov@example.com',
                    phone: '+380991234567',
                    address: 'м. Київ, вул. Прикладна, 123',
                    summary: 'Досвідчений веб-розробник з 5-річним досвідом роботи з JavaScript, HTML, CSS та React. Маю глибокі знання у створенні сучасних веб-додатків та оптимізації їх продуктивності.'
                },
                experiences: [
                    {
                        position: 'Frontend Developer',
                        company: 'Tech Solutions Inc.',
                        startDate: '2019-01',
                        endDate: '2023-12',
                        description: 'Розробка клієнтської частини веб-додатків з використанням React та Redux. Оптимізація продуктивності додатків. Участь у плануванні архітектури проекту.'
                    },
                    {
                        position: 'Junior Web Developer',
                        company: 'Web Studio',
                        startDate: '2017-06',
                        endDate: '2018-12',
                        description: 'Верстка веб-сайтів, створення адаптивних макетів. Робота з CMS системами. Тестування кросс-браузерної сумісності.'
                    }
                ],
                educations: [
                    {
                        institution: 'Київський національний університет',
                        degree: 'Магістр комп\'ютерних наук',
                        graduationYear: '2017',
                        description: 'Спеціалізація: веб-технології та штучний інтелект. Дипломна робота: "Оптимізація веб-додатків з використанням сучасних JavaScript фреймворків"'
                    }
                ],
                skills: ['JavaScript', 'HTML5', 'CSS3', 'React', 'Redux', 'Git', 'Responsive Design', 'Webpack', 'REST API']
            };
            
            fillFormWithData(exampleData);
            generateResume();
        }
    });

    // Редагування резюме
    document.getElementById('edit-resume').addEventListener('click', function() {
        const resumeData = getFormDataFromResume();
        if (resumeData) {
            fillFormWithData(resumeData);
            editMode = true;
            alert('Режим редагування увімкнено. Внесіть зміни у форму зліва та натисніть "Створити резюме"');
        }
    });

    // Завантаження PDF з використанням jsPDF
    document.getElementById('download-resume').addEventListener('click', function() {
        const btn = this;
        originalButtonText = btn.innerHTML;
        
        // Перевіряємо чи є що завантажувати
        const resumeOutput = document.getElementById('resume-output');
        if (!resumeOutput || resumeOutput.querySelector('.resume-preview')) {
            alert('Спочатку створіть резюме');
            return;
        }
        
        UIHelper.showLoading(btn);
        
        // Використовуємо jsPDF для створення PDF
        setTimeout(() => {
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                // Додаємо заголовок
                doc.setFontSize(20);
                doc.text('Резюме', 105, 20, { align: 'center' });
                
                // Отримуємо текст з резюме (без HTML тегів)
                const resumeText = resumeOutput.innerText;
                
                // Додаємо основний текст
                doc.setFontSize(12);
                const splitText = doc.splitTextToSize(resumeText, 180);
                doc.text(splitText, 15, 30);
                
                // Зберігаємо PDF
                doc.save('resume.pdf');
                
                UIHelper.hideLoading(btn, originalButtonText);
            } catch (error) {
                alert('Помилка при створенні PDF: ' + error.message);
                UIHelper.hideLoading(btn, originalButtonText);
            }
        }, 1000);
    });

    // Ініціалізація при завантаженні сторінки
    loadFromLocalStorage();

    // Автозбереження при зміні даних
    document.querySelectorAll('input, textarea').forEach(element => {
        element.addEventListener('input', function() {
            if (!editMode) {
                saveToLocalStorage();
            }
        });
    });

    // Додаткові обробники подій для динамічно створених елементів
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-skill')) {
            e.target.parentElement.remove();
            saveToLocalStorage();
            if (!editMode) generateResume();
        }
    });
});