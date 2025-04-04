'use client'
import React from 'react';
import { usePathname } from 'next/navigation'
const Footer = ()=>{
    // routing de next
    const pathname = usePathname();
    //console.log(pathname);
    const hiddenPaths = ["/login"];
    if (hiddenPaths.includes(pathname)) {
        return null; // No renderiza el sidebar
    }
    return (
        <footer className="footer py-3">
            <div className="container-fluid">
                <div className="row align-items-center justify-content-lg-between">
                <div className="col-lg-6 mb-lg-0 mb-4">
                    <div className="copyright text-center text-sm text-muted text-lg-start">
                    © 2025,
                    creado por
                    <a href="https://www.maximovalor.com" className="font-weight-bold m-1" target="_blank">Esteban Gutiérrez</a>
                    para Six Bridge.
                    </div>
                </div>
                </div>
            </div>
        </footer>
    )
}
export default Footer;