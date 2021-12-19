window.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (e) => {
        if(e.code == 'Escape') {
            window.close();
        };
    });
});