import { generateKeyPairSync } from "crypto";
import { writeFileSync } from "fs";

/**
 *  Function:     genKeyPair()
 *  Description:  generate a 4096 bit RSA key pair and store them in a file
 *  Parameters:   none
 *  Returns:      void.
 */
function genKeyPair() {
  const keyPair = generateKeyPairSync("rsa", {
    modulusLength: 4096, // bits - standard for RSA keys
    privateKeyEncoding: {
      format: "pem", // Most common formatting choice
      type: "pkcs1" // "Public Key Cryptography Standards 1"
    },
    publicKeyEncoding: {
      format: "pem", // Most common formatting choice
      type: "pkcs1" // "Public Key Cryptography Standards 1"
    }
  });

  // Generate public key file
  writeFileSync(`${__dirname}/id_rsa_pub.pem`, keyPair.publicKey);

  // Generate private key file
  writeFileSync(`${__dirname}/id_rsa_priv.pem`, keyPair.privateKey);
}

// Call the function
genKeyPair();
