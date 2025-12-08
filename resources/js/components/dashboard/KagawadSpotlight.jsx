import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Phone, Mail } from "lucide-react";

const KagawadSpotlight = ({ kagawad }) => {
  return (
    <Card className="col-span-1 lg:col-span-2 bg-gradient-to-br from-card to-accent/10">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Kagawad of the Day</CardTitle>
        </div>
        <CardDescription>Featured SK Kagawad Member</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <img
              src={kagawad.avatar}
              alt={kagawad.name}
              className="w-32 h-32 rounded-lg object-cover border-4 border-primary/20"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">{kagawad.name}</h3>
              <Badge variant="secondary" className="mt-1">
                {kagawad.position}
              </Badge>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {kagawad.bio}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{kagawad.contact}</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{kagawad.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{kagawad.address}</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Since {kagawad.dateStarted}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KagawadSpotlight;
