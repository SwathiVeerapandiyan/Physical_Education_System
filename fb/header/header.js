// header.js

document.addEventListener('DOMContentLoaded', () => {
    const searchContainer = document.querySelector('.search-container');
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input');

    if (searchBtn && searchInput && searchContainer) {
        // Toggle search bar expansion
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing immediately from document event
            
            if (!searchContainer.classList.contains('active')) {
                searchContainer.classList.add('active');
                searchInput.focus();
            } else {
                // If there's content, let the search trigger (otherwise close)
                if (searchInput.value.trim() === '') {
                    searchContainer.classList.remove('active');
                } else {
                    console.log('Search query submitted:', searchInput.value);
                    // Add custom search redirection logic here if needed
                }
            }
        });

        // Close search bar on Escape key
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchContainer.classList.remove('active');
                searchInput.value = '';
                searchInput.blur();
            }
        });

        // Close search bar if clicking outside the container
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                searchContainer.classList.remove('active');
            }
        });
    }
});
