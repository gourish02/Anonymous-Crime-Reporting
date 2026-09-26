"""
Dataset and Category Definitions for the AI Crime Classifier.
Supports 5 crime categories: Theft, Assault, Cyber Crime, Fraud, Vandalism.
"""

from typing import Dict, List, Any

CATEGORIES = [
    "Theft",
    "Assault",
    "Cyber Crime",
    "Fraud",
    "Vandalism"
]

CATEGORY_METADATA: Dict[str, Dict[str, Any]] = {
    "Theft": {
        "id": 1,
        "label": "Theft",
        "icon": "🔓",
        "base_risk": "Medium",
        "description": "Unlawful taking of another person's personal property, including burglary, robbery, pickpocketing, shoplifting, and grand theft auto.",
        "examples": [
            "Someone broke into my car and stole my laptop bag, sunglasses, and wallet.",
            "My bicycle was stolen from the bike rack outside the train station despite having a heavy chain lock."
        ]
    },
    "Assault": {
        "id": 2,
        "label": "Assault",
        "icon": "⚠️",
        "base_risk": "High",
        "description": "Physical attack or threat of physical violence against another person, including battery, mugging, physical fights, and armed confrontation.",
        "examples": [
            "A man punched me in the face and threatened me with a knife in the dark alley behind the market.",
            "Two individuals physically attacked a pedestrian at the bus terminal causing bleeding and severe bruising."
        ]
    },
    "Cyber Crime": {
        "id": 5,
        "label": "Cyber Crime",
        "icon": "💻",
        "base_risk": "High",
        "description": "Digital crimes including hacking, unauthorized system access, phishing, malware deployment, ransomware extortion, DDoS attacks, and database breaches.",
        "examples": [
            "Our company network was compromised by ransomware demanding 5 BTC to decrypt financial files.",
            "I received a spear phishing email pretending to be our CEO asking for wire transfer authorization."
        ]
    },
    "Fraud": {
        "id": 4,
        "label": "Fraud",
        "icon": "💳",
        "base_risk": "Medium",
        "description": "Deception intended for personal or financial gain, including credit card fraud, Ponzi schemes, identity theft, impersonation scams, and check forgery.",
        "examples": [
            "Unauthorized credit card transactions amounting to $4,500 were made at foreign online electronics stores.",
            "An investor convinced elderly victims to transfer retirement savings into a fake crypto arbitrage fund."
        ]
    },
    "Vandalism": {
        "id": 3,
        "label": "Vandalism",
        "icon": "🪓",
        "base_risk": "Low",
        "description": "Willful destruction, defacement, or damaging of public or private property, including graffiti, smashed windows, slashed tires, and ruined public fixtures.",
        "examples": [
            "Group of youths spray painted offensive graffiti all over the community center wall and broke several windows.",
            "Four car tires were intentionally slashed and the windshield was smashed with a brick overnight."
        ]
    }
}

# Extensive training examples for each category (text, category)
TRAINING_DATA: List[Dict[str, str]] = [
    # ── THEFT (Property taking, burglary, larceny, shoplifting, car break-in) ────
    {"text": "Someone broke into my car overnight and took my backpack containing a MacBook Pro and passport.", "category": "Theft"},
    {"text": "My locked electric bicycle was stolen from outside the metro station. The chain lock was cut with bolt cutters.", "category": "Theft"},
    {"text": "A pickpocket stole my leather wallet containing credit cards and cash on the crowded subway train.", "category": "Theft"},
    {"text": "House burglary while we were away on vacation. Jewelry, safe, and electronics were stolen from our master bedroom.", "category": "Theft"},
    {"text": "A shoplifter concealed high-end perfumes in an oversized jacket and ran out of the department store without paying.", "category": "Theft"},
    {"text": "Catalytic converter was cut off and stolen from my Toyota Prius parked on 5th Avenue.", "category": "Theft"},
    {"text": "A person snatched my iPhone 15 Pro Max directly out of my hands while I was waiting for the traffic light to change.", "category": "Theft"},
    {"text": "Our construction site was robbed overnight. Power tools, copper pipes, and heavy equipment worth $25,000 were taken.", "category": "Theft"},
    {"text": "Stolen package from front porch captured on Ring camera. Suspect drove off in an unmarked silver sedan.", "category": "Theft"},
    {"text": "A man broke the display glass at the jewelry store and grabbed several diamond rings before fleeing on a motorcycle.", "category": "Theft"},
    {"text": "Luggage stolen from the baggage carousel area at terminal 2 before I could pick it up.", "category": "Theft"},
    {"text": "Car was hotwired and driven away from the apartment underground parking garage.", "category": "Theft"},
    {"text": "Delivery driver's vehicle was stolen while left idling for two minutes outside the pizza restaurant.", "category": "Theft"},
    {"text": "Someone broke the lock on the warehouse storage unit and stole twenty boxes of brand new commercial audio equipment.", "category": "Theft"},
    {"text": "My gym locker was pried open and my Rolex watch, car keys, and designer shoes were taken.", "category": "Theft"},
    {"text": "A customer slipped five designer watches into their coat pocket and walked past the checkout cash register.", "category": "Theft"},
    {"text": "Motorcycle stolen from private driveway during the early morning hours.", "category": "Theft"},
    {"text": "Someone broke the side window of our delivery truck and removed boxes of shipped merchandise.", "category": "Theft"},
    {"text": "Purse snatched by two suspects riding on a motorized scooter who sped away on the sidewalk.", "category": "Theft"},
    {"text": "The cash register register drawer was emptied by an intruder who forced open the cafe back door after closing.", "category": "Theft"},
    {"text": "Tools and generator stolen from our landscaping pickup truck parked outside the client property.", "category": "Theft"},
    {"text": "My camera gear and drone bag were stolen out of the rental car trunk at the scenic viewpoint.", "category": "Theft"},
    {"text": "Someone entered our open garage and wheeled away a brand new riding lawnmower and golf clubs.", "category": "Theft"},
    {"text": "Office burglary over the weekend: twelve desktop monitors and four server hard drives were stolen.", "category": "Theft"},
    {"text": "Suspect slipped into the employee breakroom and stole multiple handbags and laptops.", "category": "Theft"},

    # ── ASSAULT (Physical violence, battery, threats of harm, armed confrontation) ─
    {"text": "A man attacked me with a knife in the park, demanding my phone, and slashed my jacket.", "category": "Assault"},
    {"text": "Physical fight broke out outside the nightclub where two men repeatedly punched and kicked a victim on the ground.", "category": "Assault"},
    {"text": "I was ambushed in the stairwell by an aggressive individual who struck me in the head with a blunt object.", "category": "Assault"},
    {"text": "An angry patron threatened the bartender with a broken bottle and shoved a bystander into a glass table.", "category": "Assault"},
    {"text": "Pedestrian was tackled from behind and beaten severely, requiring emergency hospitalization for facial fractures.", "category": "Assault"},
    {"text": "A suspect pulled out a handgun and pointed it at the store clerk, threatening to shoot if they didn't comply.", "category": "Assault"},
    {"text": "Road rage incident escalated into physical violence. Driver got out with a baseball bat and struck our vehicle hood and driver.", "category": "Assault"},
    {"text": "Two attackers cornered a student in the campus alley, choked them, and physically assaulted them until bystanders intervened.", "category": "Assault"},
    {"text": "Armed robbery suspect pushed the victim down concrete stairs, causing serious head trauma and broken ribs.", "category": "Assault"},
    {"text": "A man threw hot coffee onto a retail employee and slapped them across the face after an argument over store policy.", "category": "Assault"},
    {"text": "Domestic dispute turned violent with physical strikes, choking, and verbal death threats overheard by neighbors.", "category": "Assault"},
    {"text": "Gang confrontation with metal pipes and knives resulting in multiple stab wounds and blood on the pavement.", "category": "Assault"},
    {"text": "Suspect brandished a firearm at the gas station cashier and struck the cashier in the jaw with the pistol grip.", "category": "Assault"},
    {"text": "An aggressive individual spit in my face and punched me repeatedly until security guards pinned him down.", "category": "Assault"},
    {"text": "Physical altercation at the train platform where a man pushed another passenger toward the oncoming train tracks.", "category": "Assault"},
    {"text": "Individual violently attacked a paramedic who was trying to administer emergency medical aid.", "category": "Assault"},
    {"text": "Violent mugging: two assailants beat the victim with fists and heavy boots, leaving them unconscious.", "category": "Assault"},
    {"text": "A patron pulled out brass knuckles and fractured another customer's cheekbone following an argument.", "category": "Assault"},
    {"text": "Suspect attacked elderly person on public sidewalk with repeated punches to the head and ribs.", "category": "Assault"},
    {"text": "Threatened with imminent bodily harm and death by an armed man pacing aggressively outside my apartment door.", "category": "Assault"},
    {"text": "Bar fight spilled onto the street with broken glass used as a weapon against security bouncers.", "category": "Assault"},
    {"text": "Security guard was assaulted and pepper sprayed by three trespassing individuals who attempted to force entry.", "category": "Assault"},
    {"text": "Shooting incident: multiple gunshots fired into a crowd outside the music venue, injuring three people.", "category": "Assault"},
    {"text": "Man aggressively grabbed a woman by her hair and dragged her into a vehicle against her will.", "category": "Assault"},
    {"text": "Physical battery with a wooden plank causing deep lacerations and severe bleeding.", "category": "Assault"},

    # ── CYBER CRIME (Hacking, ransomware, phishing, malware, DDoS, database leaks) ─
    {"text": "Our enterprise server infrastructure was encrypted by LockBit ransomware demanding 10 Bitcoin payment.", "category": "Cyber Crime"},
    {"text": "Hacker breached our customer SQL database through an injection vulnerability and dumped 50,000 user credentials.", "category": "Cyber Crime"},
    {"text": "Phishing email spoofing our university login portal tricked over 200 students into giving up their SSO passwords.", "category": "Cyber Crime"},
    {"text": "Distributed Denial of Service DDoS attack flooded our cloud DNS servers with 400 Gbps traffic, knocking our web app offline.", "category": "Cyber Crime"},
    {"text": "My cryptocurrency MetaMask wallet was drained of 15 ETH after connecting to a malicious smart contract phishing site.", "category": "Cyber Crime"},
    {"text": "Malware trojan horse detected on corporate laptops keystroke logging employee internal communications and banking credentials.", "category": "Cyber Crime"},
    {"text": "Unauthorized access into our AWS cloud tenant where the attacker spun up hundreds of EC2 instances for crypto mining.", "category": "Cyber Crime"},
    {"text": "Someone created a fake replica of our company banking portal to harvest authentication 2FA codes and credentials.", "category": "Cyber Crime"},
    {"text": "Cyber extortion: hackers claim to have exfiltrated proprietary source code and threatened to publish it on dark web forums.", "category": "Cyber Crime"},
    {"text": "Credential stuffing attack against our user authentication API trying millions of leaked password combinations.", "category": "Cyber Crime"},
    {"text": "SIM swapping attack hijacked my phone number, bypassed SMS 2-factor authentication, and took over my email and crypto accounts.", "category": "Cyber Crime"},
    {"text": "Spyware installed remotely on my phone without consent, tracking my GPS location, camera feed, and microphone audio.", "category": "Cyber Crime"},
    {"text": "Attacker deployed a zero-day exploit targeting our Apache web server to establish reverse shell root access.", "category": "Cyber Crime"},
    {"text": "Hospital healthcare system was hit by a massive malware infection that shut down electronic health record systems.", "category": "Cyber Crime"},
    {"text": "Blackhat group defaced our government agency website with political propaganda after exploiting a WordPress plugin flaw.", "category": "Cyber Crime"},
    {"text": "Man-in-the-middle cyber attack intercepted our unencrypted network traffic and forged SSL certificates to snoop on sessions.", "category": "Cyber Crime"},
    {"text": "Zero-click exploit sent via iMessage installed Pegasus surveillance software on journalist device.", "category": "Cyber Crime"},
    {"text": "Data breach at credit bureau exposed social security numbers and personal records of millions of citizens on hacker paste sites.", "category": "Cyber Crime"},
    {"text": "Botnet attack compromised IoT smart cameras across the city to launch coordinated network saturation attacks.", "category": "Cyber Crime"},
    {"text": "Ransomware gang published stolen confidential employee medical records on their Tor leak site.", "category": "Cyber Crime"},
    {"text": "Email spoofing and business email compromise BEC led to interception of corporate vendor invoice payment instructions.", "category": "Cyber Crime"},
    {"text": "Cryptojacking script injected into high-traffic news website running hidden Monero miner on visitor browser CPU threads.", "category": "Cyber Crime"},
    {"text": "Unauthorized remote desktop protocol RDP brute-force attack successfully gained administrator rights on our accounting server.", "category": "Cyber Crime"},
    {"text": "API security flaw exposed private user direct messages and phone numbers without authentication headers.", "category": "Cyber Crime"},
    {"text": "Trojanized npm package downloaded by developers contained obfuscated payload that stole environment variable API keys.", "category": "Cyber Crime"},

    # ── FRAUD (Deception, scams, financial wire fraud, Ponzi, identity impersonation) ─
    {"text": "Victim was tricked into wiring $85,000 to an offshore escrow account by a scammer posing as a real estate agent.", "category": "Fraud"},
    {"text": "Someone opened three fraudulent credit card accounts using my Social Security Number and accumulated $18,000 in debt.", "category": "Fraud"},
    {"text": "Ponzi scheme operator promised 25% guaranteed monthly returns on forex trading, scamming dozens of retirees out of life savings.", "category": "Fraud"},
    {"text": "A fraudulent caller claiming to be from the IRS threatened me with immediate arrest unless I purchased $2,000 in Apple gift cards.", "category": "Fraud"},
    {"text": "Fake online storefront took payments for high-end GPUs and designer shoes but never shipped any products and deleted the website.", "category": "Fraud"},
    {"text": "Company accountant forged authorized signatures on corporate checks and embezzled over $250,000 over eighteen months.", "category": "Fraud"},
    {"text": "Romance scammer on dating app manipulated an elderly widower into sending $60,000 for emergency medical surgeries that did not exist.", "category": "Fraud"},
    {"text": "Unauthorized clone of my debit card was used to withdraw $3,000 from multiple ATMs after an illegal skimmer was installed at the pump.", "category": "Fraud"},
    {"text": "Contractor took a $40,000 upfront cash deposit for a kitchen renovation, demolished the walls, and disappeared without finishing.", "category": "Fraud"},
    {"text": "Employment scam: victim paid $1,500 for home office setup equipment via cashier check that subsequently bounced.", "category": "Fraud"},
    {"text": "Counterfeit $100 bills were passed at our grocery store checkout counter during rush hour.", "category": "Fraud"},
    {"text": "Identity theft suspect applied for SBA disaster relief loans and unemployment benefits in my deceased father's name.", "category": "Fraud"},
    {"text": "Crypto pump-and-dump scheme hyped up an artificial meme token, then creators executed a liquidity rug pull stealing $3 million.", "category": "Fraud"},
    {"text": "Fake lottery winning notification required victims to pay a $5,000 advance tax fee before receiving non-existent millions.", "category": "Fraud"},
    {"text": "Insurance fraud: driver intentionally caused a staged rear-end car accident to submit fraudulent bodily injury compensation claims.", "category": "Fraud"},
    {"text": "Tech support phone scam gained remote computer control and manipulated browser HTML to convince victim they received an overpayment.", "category": "Fraud"},
    {"text": "Deceptive investment advisor forged client account transfer forms to divert funds into an unregulated shell company.", "category": "Fraud"},
    {"text": "Check kiting scheme involving fraudulent deposits across four different regional bank branches.", "category": "Fraud"},
    {"text": "Scammer impersonated a sheriff's deputy claiming a bench warrant was issued for missing jury duty unless bail was wired immediately.", "category": "Fraud"},
    {"text": "Mortgage fraud application containing falsified tax returns and fabricated bank statements approved by corrupt loan officer.", "category": "Fraud"},
    {"text": "A vendor billed our municipality for 500 hours of electrical maintenance work that was never performed.", "category": "Fraud"},
    {"text": "Fake charity solicited donations for earthquake disaster relief victims and diverted all funds to personal offshore bank accounts.", "category": "Fraud"},
    {"text": "Pyramid multi-level marketing scheme coerced participants to pay $5,000 joining fees based on fabricated income representations.", "category": "Fraud"},
    {"text": "Suspect used forged power of attorney documents to sell an elderly relative's residential property without knowledge or consent.", "category": "Fraud"},
    {"text": "Credit repair scam charged upfront fees promising to erase legitimate debt and bankruptcy records from credit bureaus.", "category": "Fraud"},

    # ── VANDALISM (Property damage, graffiti, smashed windows, defacement) ────────
    {"text": "Teenagers spray painted vulgar graffiti tags and symbols across the exterior walls of our local elementary school.", "category": "Vandalism"},
    {"text": "All four tires of my vehicle were slashed with a sharp knife and the driver door was keyed from front to back.", "category": "Vandalism"},
    {"text": "Someone threw a heavy paving brick through our living room front window in the middle of the night.", "category": "Vandalism"},
    {"text": "Public park playground equipment was set on fire and melted, causing thousands of dollars in municipal damage.", "category": "Vandalism"},
    {"text": "Storefront glass display window was deliberately smashed with an iron crowbar, leaving glass all over the sidewalk.", "category": "Vandalism"},
    {"text": "Vandals destroyed public transit bus stop glass shelters and tore down route map displays along Main Street.", "category": "Vandalism"},
    {"text": "Historical monument in the city square was defaced with red spray paint and acid etching.", "category": "Vandalism"},
    {"text": "Someone poured sugar and corrosive chemicals into our work truck's fuel tank, completely destroying the engine.", "category": "Vandalism"},
    {"text": "Public restroom fixtures, porcelain sinks, and mirrors were smashed and completely vandalized at the community park.", "category": "Vandalism"},
    {"text": "Multiple mailbox units were knocked down and smashed with a baseball bat along our residential neighborhood road.", "category": "Vandalism"},
    {"text": "Group of youths overturned public trash cans, threw debris across the highway, and broke city streetlights.", "category": "Vandalism"},
    {"text": "Our community garden fences were broken down, flower beds uprooted, and watering irrigation hoses cut.", "category": "Vandalism"},
    {"text": "Car windshield was shattered by someone throwing rocks from the highway overpass.", "category": "Vandalism"},
    {"text": "Vandals tagged church doors with graffiti slogans and broke historic stained glass windows.", "category": "Vandalism"},
    {"text": "Apartment intercom buzzer system and front glass entrance doors were repeatedly kicked in and vandalized.", "category": "Vandalism"},
    {"text": "Someone scratched deep swastikas and vulgar slurs into the paint of seven cars parked on Maple Street.", "category": "Vandalism"},
    {"text": "Municipal water fountain was filled with laundry detergent and the bronze statue head was damaged with a hammer.", "category": "Vandalism"},
    {"text": "Security cameras outside our small business were spray painted black and ripped off their wall mounts.", "category": "Vandalism"},
    {"text": "Graffiti vandalism on commuter train exterior cars with aerosol spray paint while parked at the railway yard.", "category": "Vandalism"},
    {"text": "Construction fence torn down, heavy machinery windows smashed, and warning signs defaced with marker.", "category": "Vandalism"},
    {"text": "Arson attempt on private dumpster adjacent to commercial building, scorching the exterior brick wall.", "category": "Vandalism"},
    {"text": "Golf course greens intentionally ruined by an off-road ATV vehicle doing donuts in the grass.", "category": "Vandalism"},
    {"text": "Solar panel array at community solar farm was pelted with rocks and several glass panels were cracked.", "category": "Vandalism"},
    {"text": "Library book drop receptacle was filled with motor oil and vandalized, destroying hundreds of returned books.", "category": "Vandalism"},
    {"text": "Public EV charging station cables were cut and screen displays were smashed with a hammer.", "category": "Vandalism"}
]
