import React, { useRef } from "react";
import emailjs from 'emailjs-com';


const ContactForm = () => {
    const form = useRef();
    const sendEmail = (e) => {
        e.preventDefault();

        emailjs.sendForm('service_2hjl109', 'template_5pesadh', form.current, 'XNyr0maUs4VAr1VxD')
            .then((result) => {
                console.log(result.text);
            }, (error) => {
                console.log(error.text);
            });
        alert('email send!!');
    };
    return (
        <>
            <form class="form-area contact-form text-right" id="myForm" ref={form} onSubmit={sendEmail}>
                <div className="row">
                    <div className="col-lg-6 form-group form-group-top">
                        <input name="user_name" placeholder="Enter your name" onfocus="this.placeholder = ''"
                            onblur="this.placeholder = 'Enter your name'"
                            className="common-input mb-20 form-control" required="" type="text" />

                        <input name="user_email" placeholder="Enter email address"
                            pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{1,63}$"
                            onfocus="this.placeholder = ''" onblur="this.placeholder = 'Enter email address'"
                            className="common-input mb-20 form-control" required="" type="email" />

                        <input name="user_subject" placeholder="Enter your subject" onfocus="this.placeholder = ''"
                            onblur="this.placeholder = 'Enter your subject'"
                            className="common-input mb-20 form-control" required="" type="text" />
                    </div>
                    <div className="col-lg-6 form-group">
                        <textarea className="common-textarea form-control" name="user_message" placeholder="Messege"
                            onfocus="this.placeholder = ''" onblur="this.placeholder = 'Messege'"
                            required=""></textarea>
                    </div>
                    <div className="col-lg-12 submit-btn">
                        <div className="alert-msg" style={{ textAlign: 'left' }}></div>

                        <button type="submit" className="primary-btn"
                            name="submit" data-text="Send Message">
                            <span>S</span>
                            <span>e</span>
                            <span>n</span>
                            <span>d</span>
                            <span> </span>
                            <span>M</span>
                            <span>e</span>
                            <span>s</span>
                            <span>s</span>
                            <span>a</span>
                            <span>g</span>
                            <span>e</span>
                        </button>


                    </div>
                </div>
            </form>

        </>
    )
}

export default ContactForm


