import React from "react";




const JobHistory = (props) => {
    return (
        <>
            <div className="col-lg-6 ">
                <div className="single-job">
                    <div className="top-sec d-flex justify-content-between">
                        <div className="top-left">
                            <h3 class="grid-title">{props.companyName}</h3>
                            <p>{props.companyAddress}</p>
                        </div>
                        <div className="top-right">
                            <a href="#" className="primary-btn" data-text={props.startedEndDate}>
                                <span>{props.startedMonth}</span>&nbsp;
                                <span>{props.startedYear}</span>&nbsp;
                                <span>to</span>&nbsp;
                                <span>{props.finalMonth}</span>
                                <span>{props.finalYear}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}


const SkillIHave = (props) => {
    return (
        <>
            <div className="clearfix">
                <h3 class="skill-title"> <img src={props.image} alt={props.image} />{props.skillName}</h3>
                {/* <div className="skill-value">{`${props.SkillValue}%`}</div> */}
            </div>
            {/* <div data-value={props.SkillValue} className="skill-container">
                <div className="skill-percentage" ></div>
            </div> */}
        </>
    )
}

const LatestWork = (props) => {
    return (
        <div className="item">
            <div className="testi_item d-flex justify-content-center align-items-center ">
                <div className="single-work col-lg-12 col-md-6 col-sm-12 all creative">
                    <div className="relative">
                        <div className="thumb">
                            <img className="image img-fluid" src={props.image} alt="" />
                        </div>
                        <a className="overlay" href={props.myWorkLink}></a>
                    </div>
                </div>
            </div>
        </div>

    )
}
const MyTimeline = (props) => {

    return (
        <div className="timeline-item clearfix">
            <div className="time-part">
                <h3 className="item-period">{props.year}</h3>
                <span className="item-company">{props.companyName}</span>
            </div>
            <div className="divider"></div>
            <div className="mydetail-part">
                <h3 className="item-title">{props.WhatIdid}</h3>
                <ul className="text" style={{ whiteSpace: 'pre-line' }}>
                    <p>{props.WhatIdidDesc}  </p>
                </ul>
            </div>
        </div>
    )
}
export { JobHistory, SkillIHave, LatestWork, MyTimeline };

