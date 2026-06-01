/**
 * Property Data Integration Module (Brick & Fortune)
 * Connects directly to the official UK HM Land Registry Price Paid Data API (SPARQL)
 * for real-world historical sales and property valuation data in London Zone 1.
 */

const LAND_REGISTRY_SPARQL_URL = "http://landregistry.data.gov.uk/landregistry/sparql";

interface LandRegistryTransaction {
  price: number;
  date: string;
  address: string;
  street: string;
  town: string;
  postcode: string;
}

/**
 * Normalizes a UK postcode to standard uppercase with spacing
 */
function normalizePostcode(postcode: string): string {
  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
  if (cleaned.length > 4) {
    // If it's a full postcode (e.g., SW1X7LJ -> SW1X 7LJ)
    const index = cleaned.length - 3;
    return `${cleaned.substring(0, index)} ${cleaned.substring(index)}`;
  }
  return cleaned;
}

/**
 * Queries the official UK Land Registry for transaction history in a postcode or district
 */
export async function queryLandRegistry(postcodeQuery: string): Promise<LandRegistryTransaction[]> {
  const normalized = normalizePostcode(postcodeQuery);
  console.log(`[UK Land Registry] Querying historical sold prices for: "${normalized}"`);

  // We construct a query that works for both full postcodes and postcode prefixes (e.g. SW1X)
  const isFullPostcode = normalized.includes(" ") && normalized.length >= 6;
  
  let sparqlQuery = "";

  if (isFullPostcode) {
    sparqlQuery = `
      prefix lrppi: <http://landregistry.data.gov.uk/def/ppi/>
      prefix lrcommon: <http://landregistry.data.gov.uk/def/common/>
      
      SELECT ?amount ?date ?street ?town ?paon ?saon WHERE {
        ?trans lrppi:pricePaid ?amount ;
               lrppi:transactionDate ?date ;
               lrppi:propertyAddress ?addr .
        ?addr lrcommon:postcode "${normalized}" .
        OPTIONAL { ?addr lrcommon:street ?street }
        OPTIONAL { ?addr lrcommon:town ?town }
        OPTIONAL { ?addr lrcommon:paon ?paon }
        OPTIONAL { ?addr lrcommon:saon ?saon }
      } ORDER BY DESC(?date) LIMIT 10
    `;
  } else {
    // Prefix search for partial postcode (e.g., SW1X)
    sparqlQuery = `
      prefix lrppi: <http://landregistry.data.gov.uk/def/ppi/>
      prefix lrcommon: <http://landregistry.data.gov.uk/def/common/>
      
      SELECT ?amount ?date ?street ?town ?paon ?saon ?postcode WHERE {
        ?trans lrppi:pricePaid ?amount ;
               lrppi:transactionDate ?date ;
               lrppi:propertyAddress ?addr .
        ?addr lrcommon:postcode ?postcode .
        FILTER (strstarts(str(?postcode), "${normalized}"))
        OPTIONAL { ?addr lrcommon:street ?street }
        OPTIONAL { ?addr lrcommon:town ?town }
        OPTIONAL { ?addr lrcommon:paon ?paon }
        OPTIONAL { ?addr lrcommon:saon ?saon }
      } ORDER BY DESC(?date) LIMIT 10
    `;
  }

  try {
    const response = await fetch(LAND_REGISTRY_SPARQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/sparql-query",
        "Accept": "application/sparql-results+json"
      },
      body: sparqlQuery,
      // Add a reasonable timeout
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`Land Registry API returned HTTP status ${response.status}`);
    }

    const data = await response.json();
    const bindings = data.results?.bindings || [];

    return bindings.map((binding: any) => {
      const price = parseInt(binding.amount?.value || "0", 10);
      const dateRaw = binding.date?.value || "";
      const date = dateRaw ? new Date(dateRaw).toLocaleDateString("tr-TR") : "Bilinmiyor";
      const street = binding.street?.value || "";
      const town = binding.town?.value || "London";
      const postcode = binding.postcode?.value || normalized;
      const paon = binding.paon?.value || "";
      const saon = binding.saon?.value || "";

      // Format address beautifully: Flat/FlatNum, HouseNum, StreetName
      let addressParts = [];
      if (saon) addressParts.push(saon);
      if (paon) addressParts.push(paon);
      if (street) addressParts.push(street);
      const address = addressParts.join(" ");

      return {
        price,
        date,
        address,
        street,
        town,
        postcode
      };
    });
  } catch (error: any) {
    console.error("Land Registry SPARQL error:", error);
    // Return empty array on failure so orchestrator can fallback gracefully
    return [];
  }
}
