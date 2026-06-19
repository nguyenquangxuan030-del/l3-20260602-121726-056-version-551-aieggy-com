(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function() {
                mobileNav.classList.toggle("open");
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function(form) {
            form.addEventListener("submit", function(event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var action = form.getAttribute("action") || "search.html";
                var target = query ? action + "?q=" + encodeURIComponent(query) : action;
                window.location.href = target;
            });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length) {
            var current = 0;
            var showSlide = function(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function(slide, position) {
                    slide.classList.toggle("active", position === current);
                });
                dots.forEach(function(dot, position) {
                    dot.classList.toggle("active", position === current);
                });
            };
            dots.forEach(function(dot) {
                dot.addEventListener("click", function() {
                    showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                });
            });
            setInterval(function() {
                showSlide(current + 1);
            }, 5600);
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
        var emptyState = document.querySelector("[data-empty-state]");
        if (filterInput && cards.length) {
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get("q") || "";
            if (filterInput.hasAttribute("data-query-input") && queryValue) {
                filterInput.value = queryValue;
            }
            var applyFilter = function() {
                var keyword = filterInput.value.trim().toLowerCase();
                var shown = 0;
                cards.forEach(function(card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var matched = !keyword || text.indexOf(keyword) !== -1;
                    card.classList.toggle("hidden", !matched);
                    if (matched) {
                        shown += 1;
                    }
                });
                if (emptyState) {
                    emptyState.classList.toggle("show", shown === 0);
                }
            };
            filterInput.addEventListener("input", applyFilter);
            applyFilter();
        }
    });
})();
