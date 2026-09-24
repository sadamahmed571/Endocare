(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs (Disabled per user request)
    // if (typeof WOW !== 'undefined') {
    //     new WOW().init();
    // }


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').addClass('bg-white shadow-sm').css('top', '-1px');
        } else {
            $('.sticky-top').removeClass('bg-white shadow-sm').css('top', '-100px');
        }
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });
    
    // FABs Click Logic
    $(document).ready(function() {
        // Navbar Search Toggle
        $('#navSearchToggle').click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            $('#navSearchInput').toggleClass('active');
            if ($('#navSearchInput').hasClass('active')) {
                $('#navSearchInput').focus();
            }
        });

        $('#navSearchInput').on('keypress', function(e) {
            if (e.which === 13 || e.key === 'Enter') {
                e.preventDefault();
                var q = $(this).val().trim();
                if (q) {
                    var isEnglish = window.location.pathname.includes('/en/');
                    if (window.location.pathname.includes('service.html')) {
                        var prodSearch = document.getElementById('productSearch');
                        if (prodSearch) {
                            prodSearch.value = q;
                            prodSearch.dispatchEvent(new Event('input'));
                            prodSearch.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    } else {
                        window.location.href = (isEnglish ? 'service.html?q=' : 'service.html?q=') + encodeURIComponent(q);
                    }
                    $(this).removeClass('active');
                }
            }
        });

        // Pharmacovigilance Expand/Trigger
        $('#Pharmacovigilance').click(function(e) {
            e.stopPropagation();
            if (!$(this).hasClass('expanded')) {
                $(this).addClass('expanded');
            } else {
                var pvModal = document.getElementById('pvModal');
                if (pvModal) {
                    var modal = bootstrap.Modal.getInstance(pvModal) || new bootstrap.Modal(pvModal);
                    modal.show();
                    $(this).removeClass('expanded');
                }
            }
        });

        $(document).click(function(e) {
            if (!$(e.target).closest('#navSearchToggle').length && !$(e.target).closest('#navSearchInput').length) {
                $('#navSearchInput').removeClass('active');
            }
            if (!$(e.target).closest('#Pharmacovigilance').length) {
                $('#Pharmacovigilance').removeClass('expanded');
            }
            if (!$(e.target).closest('#chatbot-fab').length && !$(e.target).closest('.chatbot-overlay').length) {
                $('#chatbot-fab').removeClass('expanded');
            }
        });
        
        // --- Apply Site Settings Globablly ---
        applySiteSettings();
    });
    
    function applySiteSettings() {
        var isEnglish = window.location.pathname.includes('/en/');
        var defaultSettings = isEnglish ? {
            siteName: "NovaCare Yemen",
            siteEmail: "import@novacareplus.com",
            sitePhone: "+967-777967272",
            siteAddress: "Hadda Street, Al-Barakah Commercial Building, Sana'a",
            siteDesc: "Your trusted partner for supplying certified medical vitamins and hormones in Yemen.",
            siteFb: "https://facebook.com/novacare",
            siteWa: "https://wa.me/967777967272"
        } : {
            siteName: "NovaCare اليمن",
            siteEmail: "import@novacareplus.com",
            sitePhone: "+967-777967272",
            siteAddress: "شارع حدة، مبنى البركة التجاري، صنعاء",
            siteDesc: "شريكك الموثوق لتوريد الفيتامينات والهرمونات الطبية المعتمدة في اليمن.",
            siteFb: "https://facebook.com/novacare",
            siteWa: "https://wa.me/967777967272"
        };
        var stored = localStorage.getItem("novacare_settings");
        var settings = stored ? Object.assign({}, defaultSettings, JSON.parse(stored)) : defaultSettings;

        $('.site-email-text').text(settings.siteEmail);
        $('.site-email-href').attr('href', 'mailto:' + settings.siteEmail);
        
        $('.site-phone-text').text(settings.sitePhone);
        $('.site-phone-href').attr('href', 'tel:' + settings.sitePhone.replace(/\s+/g, ''));
        
        $('.site-address-text').text(settings.siteAddress);
        
        $('.site-fb-href').attr('href', settings.siteFb);
        $('.site-tg-href').attr('href', settings.siteTg || '#');
        $('.site-li-href').attr('href', settings.siteLi || '#');
        $('.site-wa-href').attr('href', settings.siteWa);
        
        var metaDesc = document.querySelector('meta[name="description"]');
        if(metaDesc) {
            metaDesc.setAttribute("content", settings.siteDesc);
        }
        
        if(document.title.includes("NovaCare اليمن")) {
            document.title = document.title.replace("NovaCare اليمن", settings.siteName);
        } else if(document.title.includes("NovaCare Yemen")) {
            document.title = document.title.replace("NovaCare Yemen", settings.siteName);
        }
    }
    
})(jQuery);
