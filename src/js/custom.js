

/*  Scroll top
--------------------------------------------- */

const backToTop = document.querySelector('.back-to-top');
if (null !== backToTop) {
    document.addEventListener("scroll", () => {
        function scroll() {
            window.scrollY > 200 ?
                backToTop.classList.add('active') :
                backToTop.classList.remove('active');
        }
        scroll();
    });

    backToTop.addEventListener('click', function () {
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }, 600);
    });

}


/* Logo Animation
--------------------------------------------- */
setTimeout(interval, 1000);
function interval() {
    setInterval(svgAutoPlay, 5000)
}

function svgAutoPlay() {
    const mySvg = document.querySelector('iframe');
    mySvg.contentWindow.postMessage('play', '*');
}

/*  section tracking
--------------------------------------------- */
function animateValue() {
    const skillContainers = document.querySelectorAll('.skill-container');
    if (!!skillContainers) {
        skillContainers.forEach(skillContainer => {
            const skillContainerAttr = skillContainer.getAttribute('data-value');
            var end = skillContainerAttr
            var current = 0;
            var increment = 1;
            var duration = 10000;
            var stepTime = Math.abs(Math.floor(duration / end));
            var timer = setInterval(function () {
                current += increment;
                skillContainer.querySelector('.skill-percentage').style.width = `${current}%`
                if (current == end) {
                    clearInterval(timer);
                }
            }, stepTime);
        });
    }
}

triggered = false;
window.addEventListener('load', recalculate);
window.addEventListener('scroll', recalculate);
window.addEventListener('resize', recalculate);

function recalculate() {
    var height = document.body.clientHeight,
        targetRect = document.getElementById('skill').getBoundingClientRect();
    targetY = targetRect['top'],
        targetHeight = targetRect['height'];

    if (targetY + targetHeight < height) {
        if (!triggered) {
            triggered = true;
            animateValue();
        }
    }
}