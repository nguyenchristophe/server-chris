const fs = require("fs");
const path = require("path");

// Liste des types de licence avec leurs métadonnées
const licenses = {
  neutral: {
    name: "FanLicense - Neutre",
    description: "Accès gratuit au contenu public. Rôle d’observateur.",
    image: "https://gateway.pinata.cloud/ipfs/REPLACE_THIS_HASH/neutral.png",
    attributes: [{ trait_type: "Rang", value: "Neutre" }],
  },
  visionnaire: {
    name: "FanLicense - Visionnaire",
    description: "Peut voter et soutenir des créateurs.",
    image: "https://gateway.pinata.cloud/ipfs/REPLACE_THIS_HASH/visionnaire.png",
    attributes: [{ trait_type: "Rang", value: "Visionnaire" }],
  },
  createur: {
    name: "FanLicense - Créateur",
    description: "Peut publier des contenus en illimité.",
    image: "https://gateway.pinata.cloud/ipfs/REPLACE_THIS_HASH/createur.png",
    attributes: [{ trait_type: "Rang", value: "Créateur" }],
  },
  innovateur: {
    name: "FanLicense - Innovateur",
    description: "Accès aux concours + fonctionnalités avancées.",
    image: "https://gateway.pinata.cloud/ipfs/REPLACE_THIS_HASH/innovateur.png",
    attributes: [{ trait_type: "Rang", value: "Innovateur" }],
  },
  externes_basic: {
    name: "FanLicense - Externe Basic",
    description: "Accès entreprises / location d’œuvres.",
    image: "https://gateway.pinata.cloud/ipfs/REPLACE_THIS_HASH/externes_basic.png",
    attributes: [{ trait_type: "Rang", value: "Externe Basic" }],
  },
  externes_semi_basic: {
    name: "FanLicense - Semi-Basic",
    description: "Organisation de concours physiques.",
    image: "https://gateway.pinata.cloud/ipfs/REPLACE_THIS_HASH/externes_semi_basic.png",
    attributes: [{ trait_type: "Rang", value: "Semi-Basic" }],
  },
  externes_must: {
    name: "FanLicense - Externe Must",
    description: "Concours illimités + collaborations.",
    image: "https://gateway.pinata.cloud/ipfs/REPLACE_THIS_HASH/externes_must.png",
    attributes: [{ trait_type: "Rang", value: "Externe Must" }],
  },
  must_innovateurs: {
    name: "FanLicense - Must Innovateur",
    description: "Version VIP avec tous les droits.",
    image: "https://gateway.pinata.cloud/ipfs/REPLACE_THIS_HASH/must_innovateurs.png",
    attributes: [{ trait_type: "Rang", value: "Must Innovateur" }],
  },
};

const outputDir = path.join(__dirname, "../metadata");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

for (const key in licenses) {
  const data = licenses[key];
  const filePath = path.join(outputDir, ${key}.json);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(✅ ${key}.json créé);
}
