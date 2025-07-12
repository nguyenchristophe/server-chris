// backend/utils/generateMetadata.js
const fs = require("fs");
const path = require("path");

const LICENSES = {
  neutral: { name: "Fan Neutre", description: "Accès public aux contenus.", image: "ipfs://<imgCID>/neutral.png" },
  visionnaire: { name: "Fan Visionnaire", description: "Droit de vote + contenus étendus.", image: "ipfs://<imgCID>/visionnaire.png" },
  createur: { name: "Fan Créateur", description: "Publier et créer des contenus.", image: "ipfs://<imgCID>/createur.png" },
  innovateur: { name: "Fan Innovateur", description: "Participer aux concours + gouvernance.", image: "ipfs://<imgCID>/innovateur.png" },
  externes_basic: { name: "Externe Basic", description: "Accès entreprises à la location de contenu.", image: "ipfs://<imgCID>/externes_basic.png" },
  externes_semi_basic: { name: "Externe Semi-Basic", description: "Organisation de 3 concours physiques.", image: "ipfs://<imgCID>/externes_semi_basic.png" },
  externes_must: { name: "Externe Must", description: "Accès illimité aux concours et créateurs.", image: "ipfs://<imgCID>/externes_must.png" },
  must_innovateurs: { name: "Must Innovateur", description: "Pack VIP + gouvernance étendue.", image: "ipfs://<imgCID>/must_innovateurs.png" },
};

const generateMetadataFiles = () => {
  const outputDir = path.join(__dirname, "../metadata");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  Object.entries(LICENSES).forEach(([key, meta]) => {
    const filePath = path.join(outputDir, ${key}.json);
    fs.writeFileSync(filePath, JSON.stringify(meta, null, 2));
  });

  console.log("✅ JSON metadata générés dans /metadata");
};

module.exports = generateMetadataFiles
