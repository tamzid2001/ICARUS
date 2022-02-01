const token = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI4YWYxZGI3ZDBjYzA1NmFkNzVkNmYwY2IzYmQ5ZTVlNiIsInBlcm1pc3Npb25zIjpbXSwiaWF0IjoxNjA1NTE2OTQ3LCJyZWFsVXNlcklkIjoiOGFmMWRiN2QwY2MwNTZhZDc1ZDZmMGNiM2JkOWU1ZTYifQ.Q2mBRdxm3Rz800XGLazxkZhDdZyONZWX-tcfboN4lkKiRpDioCzAP21vZ8krP6HEMJ4SPO51_TT2699h1c9W6VtkagE8dSn1jAetrZULFeomPhpy3lE8N7t7P0_yIGPvUPR19XJ6mWhrav_chB8kX7W6deAE8T0ieAm8zKCe_A47tixoXGkfZUFABHNHQO6gxj4ctfVAfolMmcHYDMYFZYSrCEtPruqCZ1UeRl1fcyRvI_3oD38sDbwowRsy5bhK-Bul6jO448YcodvFmtOBFJCV8VNAKw-Z6DfLDlgWBevTZfc_KBrmP9H3ZvUGroIVdRXg8GagEeIwdPMJ07Hjpu7cy2kz0F2i926Q-SA2gCKtYQqgzDhdZ3zMFj2howEI5cBhl9YUL_8MSAVf3OkrYcqD3JlUPhYYxoNIrpGREq6v2T6YumN8n5adKjdHTQtAP8IAJchDd8ySkkt3BaTPq_zxQ2QGKey04QNSN6NIlVjT03gj24iyhPSHun3OKCP7-g2P8BTL0_d1AW8aJBP9xPsORKEzSGr1BBKmoUtyZtgu8bqesp85Ql5cGDMvjMCLYgAmw2p-4xCp_nLRT9fZTeX65RjZsa6NdsnQGYew1bkrJYTqhd0FV-Rt21EPSIAx69NQxoM8cHqvB4jSioNKQ3kaA3QiBC9jkaxkSmkPAIY';
const api = new MetaApi(token);


//if user is signed in, if not redirect to sign in
// if(){

// }

function addAccount(){
    //if user does not have an account
    // if(){
        
    // }
    var server = document.getElementById('server');
    var acc = document.getElementById('acc');
    var pass = document.getElementById('pass');
    const provisioningProfiles = await api.provisioningProfileApi.getProvisioningProfiles();

    const account = await api.metatraderAccountApi.createAccount({
        name: 'USERID',
        type: 'cloud',
        login: acc,
        // password can be investor password for read-only access
        password: pass,
        server: server,
        provisioningProfileId: provisioningProfiles.id,
        application: 'MetaApi',
        magic: 123456,
        quoteStreamingIntervalInSeconds: 2.5, // set to 0 to receive quote per tick
        reliability: 'high' // set this field to 'high' value if you want to increase uptime of your account (recommended for production environments)
      });

      //add or update account in firebase database




}