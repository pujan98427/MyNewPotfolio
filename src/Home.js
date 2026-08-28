import React from "react";
import './css/font-awesome.min.css';
import { NavLink } from 'react-router-dom';
import { JobHistory, SkillIHave, LatestWork, MyTimeline } from './Common.jsx';
import { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from 'react-scroll'
import 'swiper/css';
import 'swiper/css/virtual';
import "swiper/css/pagination";
import './index.css';
import ContactForm from './ContactForm';
import Html5Img from './img/Skill/html5.png';
import Vite from './img/Skill/vite.svg';
import SassImg from './img/Skill/sass.png';
import Tailwind from './img/Skill/Tailwind.png';
import Css3Img from './img/Skill/css3.png';
import Webpack from './img/Skill/webpack.png';
import Grunt from './img/Skill/grunt.png';
import Gulp from './img/Skill/gulp.png';
import BootstrapImg from './img/Skill/bootstrap.png';
import SemanticuiImg from './img/Skill/semanticui.png';
import LightningImg from './img/Skill/lightning.png';
import JavascriptImg from './img/Skill/javascript.png';
import JqueryImg from './img/Skill/jquery.png';
import GitlabImg from './img/Skill/gitlab.png';
import GithubImg from './img/Skill/github.png';
import PhotoshopImg from './img/Skill/photoshop.png';
import Figma from './img/Skill/figma-1-logo-png-transparent.png';
import ReactPng from './img/Skill/reactpng.png';
import Vue from './img/Skill/Vue.png';
import XdImg from './img/Skill/xd_small.png';
import WordpressImg from './img/Skill/wordpress.png';
import seva from './img/brand/seva.png';
import banner from './img/banner1.png';
import WellnessCoach from './img/brand/wellness-coach.png';
import Magazine from './img/brand/blossom-magazine-pro.png';
import Floral from './img/brand/floralpro.png';
import CoachPodium from './img/brand/coachpodium.png';
import travelbee from './img/brand/travelbee-pro.png';
import Rishi from './img/brand/rishi.png';
import './js/all.min';
import './js/custom';

const Home = () => {

    const portfolios = [
        {
            skillLink: 'https://app.coachpodium.com/login',
            ImageLink: CoachPodium

        },

        {
            skillLink: 'https://rarathemes.com/previews/?theme=travelbee-pro',
            ImageLink: travelbee

        },

        {
            skillLink: 'https://rishitheme.com/starter-sites/',
            ImageLink: Rishi

        },
        {
            skillLink: 'https://blossomthemes.com/theme-demo/?theme=blossom-floral-pro',
            ImageLink: Floral

        },
        {
            skillLink: 'https://blossomthemes.com/theme-demo/?theme=blossom-magazine-pro',
            ImageLink: Magazine

        },
        {
            skillLink: 'https://blossomthemes.com/theme-demo/?theme=wellness-coach',
            ImageLink: WellnessCoach

        },
        {
            skillLink: 'https://blossomthemes.com/theme-demo/?theme=seva',
            ImageLink: seva

        },

    ]
    const DesignSkills = [
        {
            ImageLink: PhotoshopImg,
            skillName: " Photoshop"

        },
        {
            ImageLink: XdImg,
            skillName: " Adobe Xd"

        },

        {
            ImageLink: Figma,
            skillName: "Figma"

        },



    ]
    const BuildSkills = [
        {
            ImageLink: Grunt,
            skillName: "Grunt"

        },

        {
            ImageLink: Gulp,
            skillName: " Gulp "

        },



        {
            ImageLink: Webpack,
            skillName: " WebPack"

        },
        {
            ImageLink: Vite,
            skillName: "Vite"

        },

    ]
    const CodingSkills = [
        {
            ImageLink: Html5Img,
            skillName: "HTML 5"

        },
        {
            ImageLink: Css3Img,
            skillName: "  CSS3"

        },

        {
            ImageLink: SassImg,
            skillName: " SASS"

        },
        {
            ImageLink: Tailwind,
            skillName: "  Tailwind"

        },
        {
            ImageLink: BootstrapImg,
            skillName: "  Bootstrap"

        },
        {
            ImageLink: SemanticuiImg,
            skillName: "  Semantic UI"

        },
        {
            ImageLink: LightningImg,
            skillName: " Lightning System Design"

        },
        {
            ImageLink: JqueryImg,
            skillName: " Jquery"

        },
        {
            ImageLink: JavascriptImg,
            skillName: " Javascript"

        },
        {
            ImageLink: ReactPng,
            skillName: "React"

        },
        {
            ImageLink: Vue,
            skillName: " Vue"

        },

    ]
    const OthersSkills = [
        {
            ImageLink: WordpressImg,
            skillName: "WordPress"

        },
        {
            ImageLink: GitlabImg,
            skillName: "Gitlab"

        },

        {
            ImageLink: GithubImg,
            skillName: " GitHub"

        },



    ]
    const MyWorks = [
        {
            startYear: "2019",
            companyName: "Spark Technology",
            WhatIdid: "FrontEnd Developer",
            WhatIdidDesc: "Custom Work : Bajaj Bhavisyawani \n  Custom Work : Prisma Advertising Landing Page \n Custom Work : Aura Landing Page "
        },
        {
            startYear: "2019",
            companyName: "Wen Solution Academy",
            WhatIdid: "UI/UX Designer & FrontEnd Developer",
            WhatIdidDesc: "20+ Theme Design \n 20+ WordPress theme  \n  10+ Client Custom Work"
        },
        {
            startYear: "2021 to Present",
            companyName: "Codewing Solution",
            WhatIdid: "FrontEnd Developer",
            WhatIdidDesc: "5+ WordPress Coach theme \n  5+ WordPress Elementor theme  5+ WordPress WooCommerce \n Shopify Theme  \n  30+ Client Custom Work \n  CoachPodium(Web App in Vue) \n  Coach Profile(In Next Js)"
        },
    ]
    return (

        <>

            <section className="hero-section clip-home"  >
                <div className="" >
                    <div className="banner-content mx-w-1019  mx-auto">

                        <h1 className=" text-center font-medium text-18 "  > Hi! My name is Pujan Chapagain  </h1>
                        <p className="font-Playfair  highlight-text mx-auto text-center "><span className="block">Creative</span><span className="block">WebDeveloper</span> </p>
                        <div className=" based text-18 text-black" >
                            based in Kathmandu, Nepal
                        </div>



                    </div>
                    <div className="hero-image relative text-center">

                        <img src={banner} alt='hero image' />
                        <div className="relative hero-button">
                            <div className="hero-button-wrapper ">
                                <Link className="primary-btn" data-text="Hire Me" to="contact" spy={true} smooth={true}><span>H</span>
                                    <span>i</span>
                                    <span>r</span>
                                    <span>e</span>
                                    <span className="pl-4 inline-block"> </span>
                                    <span>M</span>
                                    <span>e</span></Link>
                                <Link className="secondary-btn" data-text="View My Work" to="latest-work" spy={true} smooth={true}><span>V</span>
                                    <span>i</span>
                                    <span>e</span>
                                    <span>w</span>
                                    <span className="pl-4 inline-block"> </span>
                                    <span>M</span>
                                    <span>y</span>
                                    <span className="pl-4 inline-block"> </span>
                                    <span>W</span>
                                    <span>o</span>
                                    <span>r</span>
                                    <span>k</span>
                                </Link>
                            </div>

                        </div>
                    </div>

                </div>
            </section>
            <section className="about-area section-gap" id="about">
                <div className="container">
                    <div className="row align-items-center justify-content-between">
                        <div className="col-lg-6 about-left desktop-only">
                            <img className="img-fluid" src={require("./img/about-me-2.png")} alt="pujan chapagain" />
                        </div>
                        <div className="col-lg-5 col-md-12 about-right">
                            <div className="section-title">
                                <h2>about myself</h2>
                            </div>
                            <div className="col-lg-6  mobile-only">
                                <img className="img-fluid" src={require("./img/about-me-2.png")} alt="pujan chapagain" />
                            </div>
                            <div className="paragraph mb-50 wow fadeIn" data-wow-duration=".8s">
                                <p>
                                    I’m Pujan Chapagain, Frontend Developer based in Kathmandu, Nepal that’s passionate about creating intuitive design solutions that enhance users’ experience while meeting their needs in an inspiring way.</p>

                                <p>My work is driven by a single goal: crafting delightful experiences through a combination of user-centred research, streamlined workflow processes and open-minded iterative collaboration.</p>

                                <p>I have about 3 year experience as a front-end developer, creating responsive websites of a high quality.
                                </p>

                            </div>

                            <a target="_blank" href="https://drive.google.com/file/d/17PKvaY0Zwol4I2UsP-kMe_JcJTJLiIqx/view?usp=sharing" className="primary-btn" data-text="Resume">
                                <span>R</span>
                                <span>e</span>
                                <span>s</span>
                                <span>u</span>
                                <span>m</span>
                                <span>e</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>


            <section className="job-area section-gap-top section-gap-bottom-90" id="job-history">
                <div className="container">
                    <div className="row d-flex">
                        <div className="col-lg-12">
                            <div className="section-title">
                                <h2>Job History</h2>
                            </div>
                        </div>
                    </div>

                    <div className="row">

                        <JobHistory companyName="Wen Solution Pvt. Ltd." companyAddress="Kupondole, Lalitpur" startedEndDate="Mar 2019 to Feb 2021" startedMonth="Nov" startedYear="2019" finalMonth="Feb" finalYear="2021" />
                        <JobHistory companyName="Codewing Solution" companyAddress="Chandol, Kathmandu" startedEndDate="Feb 2021 to present" startedMonth="Feb" startedYear="2021" finalMonth="pre" finalYear="sent" />
                    </div>
                </div>
            </section>

            <section className="service-area section-gap" id="skill">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title">
                                <h2>Resume</h2>

                            </div>
                        </div>
                    </div>

                    <div className="section-content">
                        <div className="fw-page-builder-content"><section className="fw-main-row ">
                            <div className="fw-container">
                                <div className="row">


                                    <div className=" col-lg-8 ">
                                        <div className="fw-col-inner" data-paddings="0px 0px 30px 0px">

                                            <div className="block-title">
                                                <h3>Education<span></span></h3>
                                            </div>
                                            <div className="timeline timeline-grid-item clearfix">
                                                <MyTimeline year={"2013"} companyName={'Everland Internation Academy'} WhatIdid={"School Leaving Certificate"} WhatIdidDesc={"Illam, Fikkal"} />
                                                <MyTimeline year={"2015"} companyName={'Ambition Academy'} WhatIdid={"Higher Secondary Education"} WhatIdidDesc={"Kathmandu, Baneshwor"} />
                                                <MyTimeline year={"2019"} companyName={"St. Xavier's College"} WhatIdid={"BSc. CSIT."} WhatIdidDesc={"Kathmandu, Maitighar"} />

                                            </div>

                                            <div className="timeline-divider" style={{ paddingTop: '30px' }} ></div>
                                            <div className="block-title">
                                                <h3>Experience<span></span></h3>
                                            </div>


                                            <div className="timeline timeline-grid-item clearfix">
                                                <MyTimeline year={"2019"} companyName={'Spark Technology'} WhatIdid={"FrontEnd Developer"} WhatIdidDesc={"Intern"} />
                                                <MyTimeline year={"2019"} companyName={'Wen Solution Academy'} WhatIdid={"FrontEnd Developer"} WhatIdidDesc={""} />
                                                <MyTimeline year={"2021"} companyName={'Codewing Solution'} WhatIdid={"FrontEnd Developer"} WhatIdidDesc={""} />

                                            </div>
                                            <div className="timeline-divider" style={{ paddingTop: '30px' }} ></div>
                                            <div className="block-title">
                                                <h3>Project<span></span></h3>
                                            </div>


                                            <div className="timeline timeline-grid-item clearfix">
                                                {

                                                    MyWorks.map((MyWork) => {
                                                        return (< MyTimeline year={MyWork.startYear} companyName={MyWork.companyName} WhatIdid={MyWork.WhatIdid} WhatIdidDesc={MyWork.WhatIdidDesc} />)
                                                    })
                                                }

                                            </div>
                                        </div>
                                    </div>


                                    <div className=" col-lg-4 skills">
                                        <div className="fw-col-inner" data-paddings="0px 0px 0px 0px">

                                            <div className="block-title">
                                                <h3>Design Skills<span></span></h3>
                                            </div>


                                            <div className="skills-info skills-grid-item">
                                                {

                                                    DesignSkills.map((Skill) => {
                                                        return (<SkillIHave image={Skill.ImageLink} skillName={Skill.skillName} />)
                                                    })
                                                }



                                            </div>
                                            <div className="block-title">
                                                <h3>Build Tools<span></span></h3>
                                            </div>
                                            <div className="skills-info skills-grid-item">
                                                {

                                                    BuildSkills.map((Skill) => {
                                                        return (<SkillIHave image={Skill.ImageLink} skillName={Skill.skillName} />)
                                                    })
                                                }

                                            </div>

                                            <div className="block-title">
                                                <h3>Coding Skills<span></span></h3>
                                            </div>
                                            <div className="skills-info skills-grid-item">
                                                {

                                                    CodingSkills.map((Skill) => {
                                                        return (<SkillIHave image={Skill.ImageLink} skillName={Skill.skillName} />)
                                                    })
                                                }
                                            </div>
                                            <div className="block-title">
                                                <h3>Other Skills<span></span></h3>
                                            </div>
                                            <div className="skills-info skills-grid-item">
                                                {

                                                    OthersSkills.map((Skill) => {
                                                        return (<SkillIHave image={Skill.ImageLink} skillName={Skill.skillName} />)
                                                    })
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        </div>
                    </div>

                </div>
            </section >

            <section className="testimonials_area section-gap" id="latest-work">
                <div className="container">
                    <div className="row d-flex justify-content-between align-items-end mb-40">
                        <div className="col-lg-6">
                            <div className="section-title">
                                <h2>Latest Works</h2>

                            </div>
                        </div>
                    </div>
                    <div className="testi_slider ">
                        <Swiper modules={[Autoplay]} spaceBetween={50} slidesPerView={1} Autoplay={{ delay: 2500, disableOnInteraction: false, }}    >
                            {
                                portfolios.map((portfolio) => {
                                    return (
                                        <SwiperSlide>
                                            <LatestWork skillLink={portfolio.skillLink} image={portfolio.ImageLink} />

                                        </SwiperSlide>)
                                })


                            }


                        </Swiper>


                    </div>
                </div>
            </section>

            <section className="contact-page-area section-gap" id="contact">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 d-flex flex-column address-wrap">
                            <div className="single-contact-address d-flex flex-row">
                                <div className="icon">
                                    <span className="icon-name"><i className="fa-solid fa-house-chimney"></i></span>
                                </div>
                                <div className="contact-details">
                                    <h2><address>Baneshwor,Kathmandu, Nepal</address> </h2>

                                </div>
                            </div>
                            <div className="single-contact-address d-flex flex-row">
                                <div className="icon">
                                    <span className="icon-name"><i className="fa-solid fa-phone"></i></span>
                                </div>
                                <div className="contact-details">
                                    <h2><a href="tel:+9779842735626"> 9842735626</a></h2>

                                </div>
                            </div>
                            <div className="single-contact-address d-flex flex-row">
                                <div className="icon">
                                    <span className="icon-name" ><i className="fa-solid fa-envelope"></i></span>
                                </div>
                                <div className="contact-details">
                                    <h2><a href="mailto:chapagain.pujan@gmail.com">Chapagain.pujan@gmail.com</a> </h2>
                                    <p>Send me your query anytime!</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-8">
                            <ContactForm />
                        </div>

                    </div>
                </div>
            </section>


            <footer className="footer-area">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-12">
                            <div className="footer-top flex-column">
                                <div className="footer-logo">
                                    <div className="logoIframe_wrap">
                                        <NavLink className="navbar-brand" to="/"><img src={require("./img/logo/mylogo.png")} alt="Mylogo" style={{ height: "50px" }} /></NavLink>
                                        {/* <iframe
                                            id="SVGmator__wu7gwm1660298896190"
                                            frameBorder="0"
                                            src="https://www.svgmator.com/embed/EgWmdNewuucnmeB?onload=true&onclick=true&onhover=true">
                                        </iframe> */}
                                    </div>
                                    <h2>Follow Me</h2>
                                </div>
                                <div className="footer-social">
                                    <a href="https://www.facebook.com/poojan.chapagain" target="_blank"><i className="fa-brands fa-facebook-f"></i></a>
                                    <a href="https://www.instagram.com/pujanchapagain7" target="_blank"><i className="fa-brands fa-instagram"></i></a>
                                    <a href="https://www.linkedin.com/in/pujanchapagain7" target="_blank"><i className="fa-brands fa-linkedin"></i></a>
                                </div>
                              
                            </div>
                        </div>
                    </div>
                    <div className="row footer-bottom justify-content-center">
                        <p className="col-lg-8 col-sm-12 footer-text">
                            Copyright &copy;<script>document.write(new Date().getFullYear());</script> Pujan Chapagain
                        </p>
                    </div>
                </div>
            </footer>

            <button className="back-to-top">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14.824" viewBox="0 0 18 14.824">
                    <g id="Group_5480" data-name="Group 5480" transform="translate(1 1.408)" opacity="0.9">
                        <g id="Group_5477" data-name="Group 5477" transform="translate(0 0)">
                            <path id="Path_26477" data-name="Path 26477" d="M0,0H15.889" transform="translate(0 6.072)" fill="none" stroke-linecap="round" stroke-width="2"></path>
                            <path id="Path_26478" data-name="Path 26478" d="M0,0,7.209,6,0,12.007" transform="translate(8.791 0)" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                        </g>
                    </g>
                </svg>
            </button>


        </>


    )
    // setInterval(clickHit, 1000);
    // function clickHit() {
    //     const mySvg = document.querySelector('#SVGmator__orz7rf1660300198096');
    //     mySvg.click();
    //     mySvg.contentWindow.postMessage('play', '*');
    //     mySvg.setAttribute('class', "hited");
    // }


}
export default Home;

