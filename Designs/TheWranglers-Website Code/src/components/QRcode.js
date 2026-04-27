/**
 * QR Code Screen
 * @param {*} licensePlate: License Plate to be displayed
 * @returns a screen with a qr code to be scanned
 */
export default function QRcode({licensePlate}){
    const lp={licensePlate};
    const messageRequest=lp.licensePlate 
    
    const qrGen="https://quickchart.io/qr?text="+ messageRequest;
    console.log(qrGen);
    return(<>
        <h2>QR Code</h2>
        <div className="qr-box">
            <img src={qrGen} alt="QR Code" width="80%"/>
        </div>
        </>
    );
}