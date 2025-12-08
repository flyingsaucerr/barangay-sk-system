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
    { id: 1, name: "CJ Ancheta", position: "SK Chairman", image: sk1 },
    { id: 2, name: "Melody Acuin", position: "SK Kagawad", image: sk2 },
    { id: 3, name: "Moana Calanda", position: "SK Kagawad", image: sk3 },
    { id: 4, name: "Dollar Cristal", position: "SK Kagawad", image: sk4 },
    { id: 5, name: "Paul Bandril", position: "SK Kagawad", image: sk5 },
    { id: 6, name: "Danilo Cervantes", position: "SK Kagawad", image: sk6 },
    { id: 7, name: "Rie Alden Borlongan", position: "SK Kagawad", image: sk7 },
    { id: 8, name: "Jemimah Isipin", position: "SK Kagawad", image: sk8 },
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
            About Barangay Tumana
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn more about Barangay Tumana, our officials, and our commitment
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
                    Barangay Tumana
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      2,500+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Residents Served
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      15+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Years Serving
                    </div>
                  </div>
                </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officials.map((official) => (
              <Card
                key={official.id}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted overflow-hidden">
                    <img
                      src={official.image}
                      alt={official.name}
                      className="w-full h-full object-cover transform -scale-x-100" // ✅ reflected horizontally
                    />
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-1">
                    {official.name}
                  </h3>
                  <Badge variant="outline" className="mb-3">
                    {official.position}
                  </Badge>
                </CardContent>
              </Card>
            ))}
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
