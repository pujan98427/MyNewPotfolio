import React from "react";
import { NavLink } from 'react-router-dom';
import { Link } from 'react-scroll'


const Navbar = () => {

    return (
        <>
            <header id="header">
                <div className="container nav_bg nav-header">
                    <div className="row">
                        <div className="col-12 mx-auto">
                            <div>
                                <nav className="navbar navbar-expand-lg navbar-light">
                                    <div className="container-fluid">
                                        <NavLink className="navbar-brand" to="/"><img src={require("./img/logo/mylogo.png")} alt="Mylogo" style={{ height: "50px" }} /></NavLink>
                                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                            <span className="navbar-toggler-icon"></span>
                                        </button>
                                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                                            <ul className="navbar-nav nav-menu ms-auto mb-2 mb-lg-0">
                                                <li className="nav-item">
                                                    <NavLink className="nav-link " activeClassName="active" aria-current="page" to="/">Home</NavLink>
                                                </li>
                                                <li className="nav-item">
                                                    <Link className="nav-link" to="about" spy={true} smooth={true}>About</Link>
                                                </li>
                                                <li className="nav-item">
                                                    <Link className="nav-link" to="job-history" spy={true} smooth={true} >Job History</Link>
                                                </li>
                                                <li className="nav-item">
                                                    <Link className="nav-link" to="skill" spy={true} smooth={true}>Resume</Link>
                                                </li>
                                                <li className="nav-item">
                                                    <Link className="nav-link" to="latest-work" spy={true} smooth={true}>Portfolio</Link>
                                                </li>
                                                <li className="nav-item">
                                                    <Link className="nav-link" to="contact" spy={true} smooth={true}>Contact</Link>
                                                </li>

                                            </ul>

                                        </div>
                                    </div>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

        </>
    )
}
export default Navbar;