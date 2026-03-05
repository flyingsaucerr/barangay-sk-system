import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Phone, Mail, Award, Heart } from "lucide-react";

// ✅ Proper imports (Vite supports ESM imports, not require)
import sk1 from "@/assets/sk1.jpg";
import sk2 from "@/assets/sk2.jpg";
import sk3 from "@/assets/sk3.jpg";
import sk4 from "@/assets/sk4.jpg";
import sk5 from "@/assets/sk5.jpg";
import sk6 from "@/assets/sk6.jpg";
import sk7 from "@/assets/sk7.jpg";
import sk8 from "@/assets/sk8.jpg";
import barangayHall from "@/assets/barangayHall.jpg";

const About = () => {
  const officials = [
    {
      id: 1,
      name: "CJ Ancheta",
      position: "SK Chairman",
      image: sk1,
      committees: [
        {
          name: "COMMITTEE ON HEALTH, HEALTH SERVICES AND REPRODUCTIVE HEALTH",
          role: "Head Committee",
        },
      ],
    },
    {
      id: 2,
      name: "Melody Acuin",
      position: "SK Kagawad",
      image: sk2,
      committees: [
        {
          name: "COMMITTEE ON LIVELIHOOD AND YOUTH EMPLOYMENT",
          role: "Head Committee",
        },
        {
          name: "COMMITTEE ON ENVIRONMENTAL PROTECTION, CCA AND DRRR",
          role: "Committee Member",
        },
        {
          name: "COMMITTEE ON BIDS AND AWARDS",
          role: "Committee Member",
        },
      ],
    },
    {
      id: 3,
      name: "Moana Calanda",
      position: "SK Kagawad",
      image: sk3,
      committees: [
        {
          name: "COMMITTEE ON LIVELIHOOD AND YOUTH EMPLOYMENT",
          role: "Committee Member",
        },
        {
          name: "COMMITTEE ON ENVIRONMENTAL PROTECTION, CCA AND DRRR",
          role: "Head Committee",
        },
      ],
    },
    {
      id: 4,
      name: "Dollar Cristal",
      position: "SK Kagawad",
      image: sk4,
      committees: [
        {
          name: "COMMITTEE ON HEALTH, HEALTH SERVICES AND REPRODUCTIVE HEALTH",
          role: "Head Committee",
        },
      ],
    },
    {
      id: 5,
      name: "Paul Bandril",
      position: "SK Kagawad",
      image: sk5,
      committees: [
        {
          name: "COMMITTEE ON SPORTS DEVELOPMENT",
          role: "Head Committee",
        },
        {
          name: "COMMITTEE ON ANTI DRUG ABUSE AND SOCIAL PROTECTION",
          role: "Committee Member",
        },
        {
          name: "COMMITTEE ON APPROPRIATIONS, WAYS AND MEANS",
          role: "Head Committee",
        },
      ],
    },
    {
      id: 6,
      name: "Danilo Cervantes",
      position: "SK Kagawad",
      image: sk6,
      committees: [
        {
          name: "COMMITTEE ON ANTI DRUG ABUSE AND SOCIAL PROTECTION",
          role: "Head Committee",
        },
      ],
    },
    {
      id: 7,
      name: "Rie Alden Borlongan",
      position: "SK Kagawad",
      image: sk7,
      committees: [
        {
          name: "COMMITTEE ON SPORTS DEVELOPMENT",
          role: "Committee Member",
        },
        {
          name: "COMMITTEE ON EDUCATION AND CULTURE",
          role: "Head Committee",
        },
        {
          name: "COMMITTEE ON BIDS AND AWARDS",
          role: "Head Committee",
        },
      ],
    },
    {
      id: 8,
      name: "Jemimah Isipin",
      position: "SK Kagawad",
      image: sk8,
      committees: [
        {
          name: "COMMITTEE ON HEALTH, HEALTH SERVICES AND REPRODUCTIVE HEALTH",
          role: "Committee Member",
        },
        {
          name: "COMMITTEE ON EDUCATION AND CULTURE",
          role: "Committee Member",
        },
        {
          name: "COMMITTEE ON APPROPRIATIONS, WAYS AND MEANS",
          role: "Committee Member",
        },
      ],
    },
  ];

  const achievements = [
    {
      year: "2023",
      title: "Outstanding Barangay Award",
      description:
        "Recognized for excellence in community service and governance.",
    },
    {
      year: "2022",
      title: "Clean and Green Recognition",
      description: "Awarded for environmental initiatives and cleanliness programs.",
    },
    {
      year: "2021",
      title: "Community Development Excellence",
      description:
        "Recognized for outstanding community development projects.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            About SK Tumana 2023
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn more about SK Tumana, our officials, and our commitment
            to serving the community of Marikina.
          </p>
        </div>

        {/* Hero Section */}
        <div className="mb-16">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-8">
                <div className="text-center">
                  <Users className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Sangguniang Kabataang Tumana
                  </h3>
                  <p className="text-muted-foreground">
                    Serving the community with dedication and integrity
                  </p>
                </div>
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Our Mission
                </h2>
                <p className="text-muted-foreground mb-6">
                  We aim to build a safe, sustainable, and inclusive community
                  for all residents through transparency, cooperation, and
                  development. Our commitment is to serve the people of Tumana
                  with excellence and compassion.
                </p>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Vision & Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To be a model barangay in Marikina, fostering unity, progress,
                and quality of life for all residents through effective governance
                and community participation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-500" />
                Our Values
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Transparency and Accountability</li>
                <li>• Community Participation</li>
                <li>• Sustainable Development</li>
                <li>• Social Justice and Equity</li>
                <li>• Integrity and Service Excellence</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Officials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            Barangay Officials
          </h2>

          {/* ⬇Updated grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {officials.map((official) => {
              const isChairman = official.position === "SK Chairman";

              return (
                <Card
                  key={official.id}
                  className={`text-center transition-shadow hover:shadow-lg
                    ${isChairman ? "md:col-span-2 lg:col-span-2" : ""}
                  `}
                >
                  <CardContent className="p-6">
  {/* Image */}
  <div
    className={`mx-auto mb-4 rounded-full bg-muted overflow-hidden ${
      isChairman ? "w-40 h-40" : "w-24 h-24"
    }`}
  >
    <img
      src={official.image}
      alt={official.name}
      className="w-full h-full object-cover transform -scale-x-100"
    />
  </div>

  {/* Name */}
  <h3
    className={`font-bold text-foreground mb-1 ${
      isChairman ? "text-2xl" : "text-lg"
    }`}
  >
    {official.name}
  </h3>

  {/* Position */}
  <Badge
    variant="outline"
    className={`mb-3 ${isChairman ? "text-base px-4 py-1" : ""}`}
  >
    {official.position}
  </Badge>

  {/* Committees */}
  {official.committees && official.committees.length > 0 && (
    <div className="text-left mt-2 text-sm text-muted-foreground">
      <p className="font-semibold mb-1">Committees:</p>
      <ul className="list-disc list-inside space-y-1">
        {official.committees.map((c, idx) => (
          <li key={idx}>
            <span className="font-medium">{c.name}</span> - {c.role}
          </li>
        ))}
      </ul>
    </div>
  )}
</CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            Recent Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {achievement.year}
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Visit Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Barangay Hall Address</h4>
                <p className="text-muted-foreground">
                  Barangay Tumana, Marikina, 1800 Metro Manila
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Office Hours</h4>
                <p className="text-muted-foreground">
                  Monday - Friday: 8:00 AM - 5:00 PM
                  <br />
                  Saturday: 8:00 AM - 12:00 PM
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-6 w-6 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>Barangay Hall Office</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>sktumana.marikina@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Facebook: Barangay Tumana 2023</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
