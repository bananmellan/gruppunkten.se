function initAboutOptions() {
    const optionsContainer = document.querySelector('#about .options');
    const texts = document.querySelectorAll('#about .texts div');
    const options = document.querySelectorAll('#about .option');

    optionsContainer.addEventListener('click', (event) => {
        const clickedOption = event.target.closest('.option');
        if (clickedOption && optionsContainer.contains(clickedOption)) {
            handleOptionClick(clickedOption, options, texts);
        }
    });
}

function handleOptionClick(option, options, texts) {
    const textClass = option.classList[1];
    if (!textClass) return;

    options.forEach(opt => opt.classList.remove('is-active'));
    texts.forEach(txt => txt.classList.remove('is-visible'));

    option.classList.add('is-active');
    document.querySelector(`#about .text.${textClass}`)?.classList.add('is-visible');
}

initAboutOptions();
