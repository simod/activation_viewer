
def getSldName(geom_type, map_type, data_type):
    if map_type == 'GRA':
        return 'grading_%s' % geom_type
    else:
        return styles[geom_type]

styles = {
'grading_l':
"""<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"
  xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <NamedLayer>
    <Name>Transport grading line</Name>
  "Grading lines consist in lines with the trhee grading classes and their colors red, orange and yellow"
    <UserStyle>
      <Title>Transport grading line style</Title>
      <FeatureTypeStyle>
        <Rule>
          <Title>Destroyed</Title>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>damage_gra</PropertyName>
              <Literal>Destroyed</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#F5293E</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>

        <Rule>
          <Title>Damaged</Title>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>damage_gra</PropertyName>
              <Literal>Damaged</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#F7A902</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>

        <Rule>
          <Title>Probably damaged</Title>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>damage_gra</PropertyName>
              <Literal>Probably damaged</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#ffffb7</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>

      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>""",

'grading_p':
"""<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"
  xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
" Grading points consist in squared point white outline and filled with the correspondent color red, orange and yellow"
  <NamedLayer>
    <Name>Building point grading</Name>
    <UserStyle>
      <Title>Grading point style</Title>
      <FeatureTypeStyle>
        <Rule>
          <Title>Destroyed</Title>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>damage_gra</PropertyName>
              <Literal>Destroyed</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>square</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#F5293E</CssParameter>
                </Fill>
                <Stroke>
                  <CssParameter name="stroke">#fcfcfc</CssParameter>
                  <CssParameter name="stroke-width">0.5</CssParameter>
                </Stroke>
              </Mark>
              <Size>6</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>

        <Rule>
          <Title>Damaged</Title>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>damage_gra</PropertyName>
              <Literal>Damaged</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>square</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#F7A902</CssParameter>
                </Fill>
                <Stroke>
                  <CssParameter name="stroke">#fcfcfc</CssParameter>
                  <CssParameter name="stroke-width">0.5</CssParameter>
                </Stroke>
              </Mark>
              <Size>6</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>

        <Rule>
          <Title>Probably damaged</Title>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>damage_gra</PropertyName>
              <Literal>Probably damaged</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>square</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#ffffb7</CssParameter>
                </Fill>
                <Stroke>
                  <CssParameter name="stroke">#fcfcfc</CssParameter>
                  <CssParameter name="stroke-width">0.5</CssParameter>
                </Stroke>
              </Mark>
              <Size>6</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>

      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>""",

'fill_poly_grading_a':
"""<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"
  xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <NamedLayer>
    <Name>Filled_polygon_grading</Name>
    <UserStyle>
      <Title>Only filled polygons</Title>
      <FeatureTypeStyle>
" Grading with filled polygons consist in three grades symbolized by filled polygons with no outline red, orange and yellow"
        <Rule>
          <Title>Destroyed</Title>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>damage_gra</PropertyName>
              <Literal>Destroyed</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#F5293E
              </CssParameter>
            </Fill>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Title>Damaged</Title>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>damage_gra</PropertyName>
              <Literal>Damaged</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#F7A902
              </CssParameter>
            </Fill>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Title>Probably damaged</Title>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>damage_gra</PropertyName>
              <Literal>Probably damaged</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#ffffb7
              </CssParameter>
            </Fill>
          </PolygonSymbolizer>
        </Rule>

      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>""",

'poly_grading_a':
"""<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"
  xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <NamedLayer>
    <Name>Not_filled_poly_grading</Name>
    <UserStyle>
      <Title>Only outlined polygons</Title>
      <FeatureTypeStyle>
" Consists in three grades symbolized by not filled polygons red, orange and yellow"
        <Rule>
          <Title>Destroyed</Title>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>damage_gra</PropertyName>
              <Literal>Destroyed</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <PolygonSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#F5293E</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Title>Damaged</Title>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>damage_gra</PropertyName>
              <Literal>Damaged</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <PolygonSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#F7A902</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <Rule>
          <Title>Probably damaged</Title>
          <Filter>
            <PropertyIsEqualTo>
              <PropertyName>damage_gra</PropertyName>
              <Literal>Probably damaged</Literal>
            </PropertyIsEqualTo>
          </Filter>
          <PolygonSymbolizer>
             <Stroke>
              <CssParameter name="stroke">#ffffb7</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>""",

'floods_a':
"""<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"
  xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <NamedLayer>
    <Name>Flooded areas</Name>
    <UserStyle>
      <Title>Blue polygons</Title>
      <FeatureTypeStyle>
"Flooded area is defined by a blue polygon, outline and fill the same blue"
        <Rule>
          <Title>Flooded area</Title>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#2DE2F0
              </CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#2DE2F0</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>"""

}
